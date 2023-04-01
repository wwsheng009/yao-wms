// Ping 远程函数
// 如果需要从 yao 调用开发目录的脚本就按这个格式进行封装代码
function Ping(...args) {
  return Process("scripts.jsproxy.RemoteProcess", "scripts.ping.Ping", ...args);
}
