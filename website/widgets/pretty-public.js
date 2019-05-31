module.exports={
  renderEntry: function(entryID, json){
    return `<p class="prettyEntry"><a href="./?id=${entryID}">#</a> ${json}</p>`;
  },
};
