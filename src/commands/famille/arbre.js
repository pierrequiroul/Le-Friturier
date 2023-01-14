const Discord = require('discord.js');

const Schema = require("../../database/models/family");

module.exports = async (client, interaction, args) => {
    
    // Generate Tree
    function normalize(node, idx, nodes) {
      const from = idx ? nodes[idx - 1].level : -1;
      const to = node.level;
      const results = [];
      for (let i = from + 1; i < to; i++) {
        results.push({ level: i });
      }
      results.push(node);
      return results;
    }

    function parse(text) {
      const nodes = [].concat(
        ...text
          .split(/\r?\n/)
          .filter(line => line.startsWith('#'))
          .map(line => ({
            level: line.replace(/^(#+).*/, '$1').length - 1,
            text: line.replace(/^#+/, '').trim(),
          }))
          .map(normalize)
      );
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].children = nodes[i].children || [];
        for (let j = i - 1; j >= 0; j--) {
          if (nodes[j].level + 1 === nodes[i].level) {
            nodes[j].children.push(nodes[i]);
            break;
          }
        }
      }
      return nodes.filter(node => !node.level);
    }

    function gen(nodes = [], level = 0, prefix = '') {
      return nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        const line = level ? `${prefix}${isLast ? '└' : '├'}── ` : '';
        const nextPrefix = level ? `${prefix}${isLast ? '    ' : '│   '}` : '';
        return [
          `${line}${node.text || ''}`,
          ...gen(node.children, level + 1, nextPrefix),
        ].join('\n');
      });
    }

    function render() {
      output = gen(parse(input)).join('\n');
    }

    const input = `
    # the
    ## quick
    ### brown
    ## fox
    ## jumps
    ### over
    #### the
    ### lazy
    ## dog
    `.trim();
    //render();
    
    const target = interaction.options.getUser('membre') || interaction.user;

    const data = await Schema.findOne({ Guild: interaction.guild.id, User: target.id });

    let parents = [];
    if (data && data.Parent.length > 0) {
        for (let i = 0; i < data.Parent.length; i++) {
            parents.push("<@!" + data.Parent[i] + ">");
        }
    }
    let children = [];
    if (data && data.Children.length > 0) {

        for (let i = 0; i < data.Children.length; i++) {
            children.push("<@!" + data.Children[i] + ">");
        }
    }
    // Check siblings
    if (data && data.Parent.length > 0) {
        let siblings = new Set();
        const parentPromises = data.Parent.map(async parent => {
            const dataParent = await Schema.findOne({ Guild: interaction.guild.id, User: parent });
            if (dataParent && dataParent.Children.length > 0) {
                for (let i = 0; i < dataParent.Children.length; i++) {
                    if (target.id !== dataParent.Children[i]) siblings.add("<@!" + dataParent.Children[i] + ">");
                }
            }
        });
        await Promise.all(parentPromises);
        /*if(data.Parent.length > 1) {
            siblings.add("\n");
        } 
        siblings = [...siblings].join(", ");

    } else {
        siblings = `Cette personne n'a pas de frères et soeurs`*/
    };
    let fields = [{
                name: `Partenaire`,
                value: render()//`${data && data.Partner ? `<@!${data.Partner}>` : `Cette personne n'est pas mariée`}`
            }/*,
            {
                name: `Parents`,
                value: `${data && data.Parent.length > 0 ? `${parents.join(", ")}` : `Cette personne n'a pas de parents`}`
            }*/
        ];

    
    /*
    fields.push({
        name: `Frères/Soeurs`,
        value: siblings
    });
    fields.push({
        name: `Enfants`,
        value: `${data && data.Children.length > 0 ? `${children.join(", ")}` : `Cette personne n'a pas d'enfants`}`
    });
    */
    
    
    client.embed({
        title: `👪・Famille de ${target.username}`,
        thumbnail: target.avatarURL({ size: 1024 }),
        fields: fields,
        type: 'editreply'
    }, interaction, false)
}

 
