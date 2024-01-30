/**
 * 保存用户: 同步人脸识别信息
 */
function AfterSave(id) {
  Push(id); // 同步人脸信息
  return id;
}

/**
 * 删除用户: 同步删除人脸信息
 */
function AfterDelete(id) {
  console.log("delete");
  Delete(id);
  return id;
}

/**
 * 从边缘节点读取用户资料(包含照片Base64数据)
 * REST: /user/find/:id  @/apis/user.http.json
 * @param {*} id
 */
function Find(id) {
  const user = Process("models.user.Find", id, {
    select: ["id", "name", "user_sn", "photo"],
  });

  if (user && user.code && user.message) {
    return user;
  }

  var photoData = "";
  var photoPath = user.photo.length > 0 ? user.photo[0] : null;
  if (photoPath) {
    const photo = Process("fs.system.ReadFile", photoPath, true);
    if (photo.content) {
      photoData = photo.content;
    }
  }
  return { id: id, user_sn: user.user_sn, name: user.name, photo: photoData };
}

/**
 * 接收边缘节点用户信息更新回执
 * REST: /user/update/:id  @/apis/user.http.json
 * @param {*} id
 * @param {*} data
 */
function Update(id, data) {
  var res = Process("models.user.Update", id, data);
  if (res && res.code && res.message) {
    throw new Exception(res.message, res.code);
  }
}

/**
 * 向边缘节点广播: 用户删除消息
 * @param {*} id
 */
function Delete(id) {
  user = GetUser(id);
  // 同步删除数据
  if (user.user_sn) {
    Process("scripts.node.Broadcast", "DeleteUser", {
      id: id,
      user_sn: user.user_sn,
    });
  }
}

/**
 * 向边缘节点广播: 用户更新消息
 * @param {*} id
 */
function Push(id) {
  user = GetUser(id);

  // 停用
  if (user.status == "停用") {
    Delete(id);
    return;
  }

  // 同步人脸识别信息
  if (
    user.user_sn &&
    user.name &&
    user.photo &&
    user.photo.length > 0 &&
    user.status == "启用"
  ) {
    Process("models.User.Save", {
      id: id,
      face_in: "同步中",
      face_out: "同步中",
    });
    Process("scripts.node.Broadcast", "UpdateUser", { id: id });
  }
}

/**
 * 删除所有用户
 */
function Clear() {
  Process("scripts.node.Broadcast", "CleanUsers", {});
}

/**
 * 读取用户信息
 * @param {*} id
 * @returns
 */
function GetUser(id) {
  return Process("models.user.Find", id, {
    select: ["id", "name", "user_sn", "photo", "status"],
  });
}

/**
 * 使用用户 SN 查询用户资料
 * @param {*} user_sn
 * @returns
 */
function GetBySN(user_sn) {
  var users = Process("models.user.Get", {
    select: ["id", "user_sn", "name", "photo", "status"],
    wheres: [{ column: "user_sn", value: user_sn }],
  });

  if (users.code && users.code != 200) {
    throw new Exception(`查询用户失败 ${user_sn} ${users.message}`, 404);
  }

  if (users.length == 0) {
    throw new Exception(`未找到用户 ${user_sn} `, 404);
  }

  var user = users[0] || {};
  return user;
}

/**
 * 使用用户 ID 查询用户资料
 * @param {*} id
 * @returns
 */
function GetByID(id) {
  return Process("models.user.Find", id, {
    select: ["id", "name", "user_sn", "photo", "status"],
  });
}
/**
 * 获取所有用户信息
 * @param {*}
 * @returns
 */
function GetAllUser() {
  return Process("models.user.get", {
    select: ["id", "name"],
  });
}

/**
 * 自定义一个用户登录的处理器,使用用户名密码登录，不需要验证码
 * yao run scripts.amis.user.Login
 * @param {object} payload 用户登录信息
 * @returns 返回登录信息
 */
function Login(payload) {
  if (payload.captcha && typeof captcha === "object") {
    const captcha = Process(
      "yao.utils.CaptchaValidate",
      payload.captcha.id,
      payload.captcha.code
    );
    if (captcha !== true) {
      throw new Exception("验证码不正确!", 400);
    }
  }

  let { password, email, mobile, userName } = payload;

  let user = null;
  if (email != null) {
    user = getUserInfo("email", email);
  } else if (mobile != null) {
    user = getUserInfo("mobile", email);
  } else if (userName != null) {
    user = getUserInfo("email", userName);
  }
  if (!user) {
    throw new Exception(400, "用户不存在");
  }
  try {
    const password_validate = Process(
      "utils.pwd.Verify",
      password,
      user.password
    );
    if (password_validate !== true) {
      throw new Exception(400, "密码不正确");
    }
  } catch (error) {
    throw new Exception(400, "密码不正确");
  }
  const timeout = 60 * 60 * 8;
  const sessionId = Process("utils.str.UUID");
  let userPayload = { ...user };
  delete userPayload.password;
  const jwtOptions = {
    timeout: timeout,
    sid: sessionId,
  };
  const jwtClaims = { user_name: user.name };
  //需要注意的是在这里无法生成studio的token,因为这个处理器只接受3个参数，
  //而生成studio的token需要在第4个参数里传入secretkey
  const jwt = Process("utils.jwt.Make", user.id, jwtClaims, jwtOptions);
  Process("session.set", "user", userPayload, timeout, sessionId);
  Process("session.set", "token", jwt.token, timeout, sessionId);
  Process("session.set", "user_id", user.id, timeout, sessionId);

  return {
    sid: sessionId,
    user: userPayload,
    menus: Process("scripts.menu.getUserMenu"),
    token: jwt.token,
    expires_at: jwt.expires_at,
  };
}

function getUserInfo(type, value) {
  const supportTypes = {
    email: "email",
    mobile: "mobile",
  };
  if (!supportTypes[type]) {
    throw new Exception(`Login type :${type} is not support`);
  }

  const [user] = Process("models.admin.user.get", {
    select: [
      "id",
      "name",
      "password",
      "type",
      "email",
      "mobile",
      "extra",
      "status",
    ],
    wheres: [
      { column: supportTypes[type], value: value },
      { Column: "status", Value: "enabled" },
    ],
    limit: 1,
  });
  return user;
}
