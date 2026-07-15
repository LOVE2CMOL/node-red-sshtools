module.exports = function(RED) {
    "use strict";

    function ssh_reconnect(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        // 绑定ssh-conncfg配置
        const connCfgNode = RED.nodes.getNode(config.sshccfg);

        node.on("input", function(msg) {
            if (!connCfgNode || !connCfgNode.ssh_ctrl) {
                node.status({ fill: "red", shape: "ring", text: "未选择SSH连接配置" });
                node.error("ssh-reconnect：未绑定有效的ssh-conncfg配置");
                return;
            }

            const sshIns = connCfgNode.ssh_ctrl();
            if (!sshIns || typeof sshIns.reconnect !== "function") {
                node.status({ fill: "red", shape: "ring", text: "无reconnect方法，请修复sshtools.js" });
                node.error("ssh-reconnect：SSH实例缺少reconnect函数");
                return;
            }

            // 执行重连
            sshIns.reconnect();
            node.status({ fill: "green", shape: "dot", text: "已触发SSH重连" });
            // 输出原消息，可串联后续逻辑
            node.send(msg);
        });

        node.on("close", function(done) {
            node.status({});
            done();
        });
    }

    // 注册节点
    RED.nodes.registerType("ssh-reconnect", ssh_reconnect);
}