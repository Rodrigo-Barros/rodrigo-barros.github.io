var firebaseConfig = {
  apiKey: "AIzaSyCsN26XOJGlwKrffZo9aUqPYthINErCwNU",
  authDomain: "little-blog-31545.firebaseapp.com",
  databaseURL: "https://little-blog-31545.firebaseio.com",
  projectId: "little-blog-31545",
  storageBucket: "little-blog-31545.appspot.com",
  messagingSenderId: "868159138446",
  appId: "1:868159138446:web:aa4f1d4c22f791b3fd77df"
};
firebase.initializeApp(firebaseConfig);

class firebaseActions {
  constructor() {
    if (firebase.database) this.DB = firebase.database();
    if (firebase.auth) this.auth = firebase.auth();
    if (firebase.firestore) this.fireStore = firebase.firestore();
    this.page = window.location.href.split("/").pop();
  }

  // Somente referencia a tabela/coleção
  table(tableName) {
    return this.fireStore.collection(tableName);
  }

  createAdmin(email, password) {
    return this.auth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        console.log(console.log("admin criado com sucesso"));
        return true;
      })
      .catch((error) => {
        console.log("erro ao criar um novo admin " + error);
        return false;
      });
  }

  publicarPost() {
    var title = $("#post-title");
    var content = $("#post-content");
    this.table("posts")
      .doc()
      .set({
        titulo: title.val(),
        conteudo: content.val()
      });
    title.val("");
    content.val("");
  }

  async getPosts() {
    return this.table("posts")
      .get()
      .then((querySnapshot) => {
        var posts = [];
        querySnapshot.forEach((doc) => {
          var data = { id: doc.id, data: doc.data() };
          posts.push(data);
        });
        return posts;
      });
  }

  async loginAdmin() {
    var email = $("#email").val();
    var senha = $("#senha").val();
    return this.table("admins")
      .where("email", "==", email)
      .where("senha", "==", senha)
      .get()
      .then((query) => {
        if (query.empty == false) {
          query.forEach((doc) => {
            alert("Usuario autenticado com sucesso");
            window.location.href = "dashboard.html";
            document.cookie = "adminIsAuth=true";
            return true;
          });
        } else {
          alert("Usuario ou senha incorretos");
          return false;
        }
      });
  }

  deletePost(postId) {
    this.table("posts")
      .doc(postId)
      .delete();
  }

  query() {
    return this.query;
  }

  async createUser(email, senha) {
    //var email = $("email").val();
    //var senha = $("senha").val();
    return this.auth
      .createUserWithEmailAndPassword(email, senha)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  async loginUser() {
    email = $("#email").val();
    senha = $("#senha").val();

    this.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then(function() {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      return firebase
        .auth()
        .signInWithEmailAndPassword(email, senha)
        .then(() => {
          alert("Usuario autenticado com sucesso");
          window.history.back();
        })
        .catch(() => {
          alert("usuário ou senha incorretos");
        });
    });
  }

  async checkIfUserIsAuthenticated() {
    var userIsAuth = false;
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        userIsAuth = true;
        $("#comment-area").removeAttr("disabled");
      } else {
        $("#comment-area").attr("disabled", "true");
      }
    });

    return userIsAuth;
  }
}

var Actions = new firebaseActions();

// call function by page
switch (Actions.page) {
  case "post.html":
  case "post.html#":
    Actions.checkIfUserIsAuthenticated();
    break;
  case "login.html":
    $("form").on("submit", function(e) {
      var userIsLogged = Actions.loginUser();
      if (userIsLogged) {
        e.preventDefault();
      }
    });
    break;
  case "login-admin.html":
    $("form").on("submit", function(e) {
      var adminIsLogged = Actions.loginAdmin();
      if (adminIsLogged) {
        e.preventDefault();
      }
    });
    break;
  case "index.html":
  case "":
    mountPosts();
    break;
  case "dashboard.html":
  case "dashboard.html#":
    checkIfAdminIsaAuthenticated();
    getPostsOnAdminPage();
    break;
  case "cadastro.html":
    $("form").on("submit", (e) => {
      if (cadastrarUsuario()) {
        e.preventDefault();
      }
    });
    break;

  default:
}

if (Actions.page.split("?")[0] == "post.html") {
  mountPost();
  Actions.checkIfUserIsAuthenticated();
  getComments();
}

function cadastraradmin() {
  var email = $("#email").val();
  var senha = $("#password").val();
  var senhaverify = $("#password-check").val();
  var msg = "noerror";

  if (senhaverify == "" || senha == "") {
    msg = "por favor preencha todos os campos";
  } else if (senhaverify != senha) {
    msg = "uma das senha informadas divergem, por favor verfique";
  }

  if (msg == "noerror") {
    if (actions.createadmin(email, senha)) alert("administrador criado com sucesso");
    else alert("erro ao criar o administrador");
  } else {
    alert(msg);
  }
}

async function cadastrarUsuario() {
  var email = $("#email").val();
  var senha = $("#senha").val();
  var senhaverify = $("#senha-check").val();
  var msg = "noerror";

  if (senhaverify == "" || senha == "") {
    alert("por favor preencha todos os campos");
    msg = 1;
    return false;
  } else if (senhaverify != senha) {
    alert("uma das senha informadas divergem, por favor verfique");
    msg = 2;
    return false;
  }

  if (msg == "noerror") {
    if (await Actions.createUser(email, senha)) {
      alert("Usuário criado com sucesso");
      window.history.back();
      msg = 3;
      return true;
    } else {
      alert("erro ao criar o Usuario");
      msg = 4;
      return false;
    }
  } else {
    alert(msg);
    return false;
  }
}

async function postComment() {
  userId = Actions.auth.getUid();
  if (userId) {
    if ($("#comment-area").val() != "") makeComent($("#comment-area").val());
    else alert("É necessário escrever alguma coisa antes de comentar");
  } else {
    alert("é necessário estar autenticado para postar um comentario");
    window.location.href = "login.html";
  }
}

function showPostDialog() {
  $("#action").val("set");
  $("#post").removeClass("d-none");
}

function cancelarPost() {
  $("#post").addClass("d-none");
  $("#post-title").val("");
  $("#post-content").val("");
}

async function mountPosts() {
  var postLayout = $("#posts-node");
  var posts = await Actions.getPosts();
  posts.forEach((i) => {
    postLayout.append(`
        <div class="card mb-4 col-12 card-post">
          <div class="card-body">
            <h2 class="card-title">${i.data.titulo}</h2>
            <hr/>
            <p class="card-text">${i.data.conteudo}</p>
            <a href="post.html?postId=${i.id}" class="btn btn-primary">Ler mais &rarr;</a>
          </div>
        </div>
      `);
  });
  hideContentOnHomePage();
}

function logoutAdmin() {
  document.cookie = "adminIsAuth=false";
  alert("sessão encerrada com sucesso");
  window.location.href = "index.html";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1);
    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}

function checkIfAdminIsaAuthenticated() {
  loginAdmin = getCookie("adminIsAuth");
  if (loginAdmin != "true") {
    alert("você não tem permissão para ver o conteúdo dessa página");
    window.location.href = "index.html";
  }
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

function mountPost() {
  var postId = getUrlVars().postId;
  firebase
    .firestore()
    .collection("posts")
    .get()
    .then((query) => {
      query.forEach((doc) => {
        if (postId == doc.id) {
          document.title = doc.data().titulo;
          postContent = `
          <section class="col-12">
            <h1>${doc.data().titulo}</h1>
            <hr>
            <p>${doc.data().conteudo}</p>
          </section>
        `;
          $("#post").prepend(postContent);
        }
      });
    });
}

function showDialogAddAdmin() {
  $("#admin").removeClass("d-none");
}

function hideDialogAddAdmin() {
  $("#email").val("");
  $("#password").val("");
  $("#password-check").val("");
  $("#admin").addClass("d-none");
}

function cadastrarAdmin() {
  var email = $("#email").val();
  var senha = $("#password").val();
  var senhaverify = $("#password-check").val();
  console.log(senha + " " + senhaverify);
  if (email == "") {
    alert("o campo email não pode ficar vazio");
  } else if (senha != senhaverify) {
    alert("as senha divergem por favor verifique");
  } else {
    Actions.table("admins")
      .doc()
      .set({
        email: email,
        senha: senha
      });
    alert("administrador criado com sucesso");
  }
}

async function getPostsOnAdminPage() {
  var posts = await Actions.getPosts();

  posts.forEach((i) => {
    var html = `
        <div class="col-12 mb-3 admin-post">
          <section>
            <h1>${i.data.titulo}</h1>
            <p>${i.data.conteudo}</p>
          </section>
          <button type="button" class="btn btn-primary" onclick="getPostInfo('${i.id}',this)">editar</button>
          <button type="button" class="btn btn-danger" onclick="deletePost('${i.id}',this)">excluir</button>
        </div>
  `;
    $("#posts-node").append(html);
  });
}

function hideContentOnHomePage() {
  $("#posts-node")
    .children(".card-post")
    .each(function(a, b) {
      $(this)
        .find(".card-body")
        .children()
        .each(function() {
          if ($(this).attr("homepage-show") == "false") $(this).css("display", "none");
        });
    });
}

function getPostInfo(postId, element) {
  $(window).scrollTop(0);
  $("#action").val("edit");
  $("#post-title").val("");
  $("#post-content").val("");
  var postInfo = element.parentNode.children[0].children;
  var postTitle = postInfo[0].innerHTML;
  var postContent = $(element)
    .parent()
    .find("*")
    .html()
    .replace(/<h1>(.*?)<\/h1>|<p>\s*<\/p>|\s(\s)/gi, "")
    .replace(/^\s(\s)|\s{2}$/g, "");

  $("#post-title").val(postTitle);
  $("#post-content").val(postContent);

  $("#post").removeClass("d-none");
  PostId = postId;
}

function setPostData(postId) {
  Actions.table("posts")
    .doc(postId)
    .set({
      titulo: $("#post-title").val(),
      conteudo: $("#post-content").val()
    });
}

async function deletePost(postId) {
  if (confirm("Deseja realmente apagar esse Post?")) {
    // antes de apagar o post apaga os comentários daquele post também
    await Actions.table("comments")
      .where("post_id", "==", postId)
      .get()
      .then((query) => {
        query.forEach((doc) => {
          Actions.table("comments")
            .doc(doc.id)
            .delete();
        });
      });

    Actions.table("posts")
      .doc(postId)
      .delete();
  } else {
    alert("Ação cancelada pelo usuário");
  }
}

function selectAction() {
  if ($("#action").val() == "set") {
    Actions.publicarPost();
  } else if ($("#action").val() == "edit") {
    setPostData(PostId);
  }
}

function makeComent(text) {
  var commentHTML = `
         <div class="col-12 comment bg-primary">
            <b>${Actions.auth.currentUser.email} says:</b>
            <p class="d-block float-left">
              <img
                class="d-block float-left"
                src="http://iconshow.me/media/images/Mixed/small-n-flat-icon/png/512/user-alt.png"
                alt="user-image-profile"
              />
              ${text}
            </p>
          </div>
  `;
  Actions.table("comments")
    .doc()
    .set({
      comment: text,
      post_id: getUrlVars().postId,
      email: Actions.auth.currentUser.email
    });

  $("#post").append(commentHTML);
  $("textarea").val("");

  $(window).scrollTop($(window).scrollTop() + 500);
}

function getComments() {
  //var commentHTML = `
  //       <div class="col-12 offset-md-1 col-md-10 comment bg-primary">
  //          <b>${Actions.auth.currentUser.email} says:</b>
  //          <p class="d-block float-left">
  //            <img
  //              class="d-block float-left"
  //              src="http://iconshow.me/media/images/Mixed/small-n-flat-icon/png/512/user-alt.png"
  //              alt="user-image-profile"
  //            />
  //            ${text}
  //          </p>
  //        </div>
  //`;
  Actions.table("comments")
    .where("post_id", "==", getUrlVars().postId)
    .get()
    .then((query) => {
      query.forEach((doc) => {
        var commentHTML = `
         <div class="col-12 comment bg-primary">
            <b>${doc.data().email} says:</b>
            <p class="d-block float-left">
              <img
                class="d-block float-left"
                src="http://iconshow.me/media/images/Mixed/small-n-flat-icon/png/512/user-alt.png"
                alt="user-image-profile"
              />
              ${doc.data().comment}
            </p>
          </div>
        `;

        $("#post").append(commentHTML);
      });
    });
}

//onclick="Actions.publicarPost()"
