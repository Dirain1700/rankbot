/** @type {string} fileName */
module.exports = async (filePath, interaction) => {
    const { inlineCode } = require("@discordjs/builders");

    if (!filePath || !isExist(filePath)) return;

    interaction.deferReply({ ephemeral: false });
    delete require.cache[require.resolve(filePath)];
    interaction.followUp(`Hotpatch successed: ${inlineCode(filePath + ".js")}`);

    /** @type {string} filePath */
    function isExist(filePath) {
        try {
            require(filePath);
            return true;
        } catch (e) {
            if (e.code === "MODULE_NOT_FOUND") return false;
            else return;
        }
    }
};
