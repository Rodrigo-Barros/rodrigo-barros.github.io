// ref database
var database = firebase.database();

function loginAdmin(){
  user=document.getElementById('nome').value;
  senha=document.getElementById('senha').value;
  database.ref('/portifolio/users/1/pass/').once('value').then((snapshot)=>{
    if(snapshot.val()==md5(senha) && user=="rodrigo"){
      window.location="sobre.html";
    }else{
      alert("você não possui permissão para acessar essa página");
    }
  });
}
