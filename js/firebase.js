function htmlPrintFromDB(tree,id){
  getTreeInfo(tree);
  setTimeout(
  ()=>{
    console.log(DBinfo);
    document.getElementById(id).innerHTML=DBinfo;
  },2000);
}

function getTreeInfo(tree){
  return firebase.database().ref('/' + tree).once('value').then(function(snapshot) {
    DBinfo = snapshot.val();
  });
}

htmlPrintFromDB('portifolio/users/1/nome','info');
