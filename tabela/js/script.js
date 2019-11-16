class firebaseActions {
  constructor() {
    var firebaseConfig = {
      apiKey: "AIzaSyA6wI81F7aAQQRaESHcmY102KOoAHg2TBo",
      authDomain: "liga-de-formula-1.firebaseapp.com",
      databaseURL: "https://liga-de-formula-1.firebaseio.com",
      projectId: "liga-de-formula-1",
      storageBucket: "liga-de-formula-1.appspot.com",
      messagingSenderId: "341942920849",
      appId: "1:341942920849:web:2fd13004d6e91068964130"
    };

    // Initialize Firebase
    //firebase.analytics();
    firebase.initializeApp(firebaseConfig);
    this.page = window.location.href.split("/").pop();
    if (
      this.page == "" ||
      this.page == "#" ||
      this.page == "index.html" ||
      this.page == "index.html#" ||
      this.page == "dashboard.html" ||
      this.page == "dashboard.html#" ||
      this.page == ""
    )
      this.DB = firebase.database();
    this.Auth = firebase.auth();
  }

  createUser(email, password) {
    this.Auth.createUserWithEmailAndPassword(email, password).catch((error) => {
      console.log(error);
    });
  }

  loginAdmin() {
    email = $("#email").val();
    password = $("#password").val();
    this.Auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(() => {
        return this.Auth.signInWithEmailAndPassword(email, password);
      })
      .catch(() => {
        alert("email ou senha incorretos");
      })
      .catch((error) => {
        console.log("nao foi possivel autenticar devido ao erro" + error);
      });
  }

  logout() {
    this.Auth.signOut();
  }

  authUser() {
    this.Auth.onAuthStateChanged((user) => {
      if (!user) window.location.href = "index.html";
    });
  }

  refTable(tableName, id) {
    id = typeof id == "undefined" ? "/" : "/" + id;
    return this.DB.ref(tableName + id);
  }
}

Actions = new firebaseActions();

tabela = $("#info");

checked = 0;

function showPass() {
  var password = document.getElementById("password");
  if (checked == 0) {
    password.setAttribute("type", "text");
    checked = 1;
  } else {
    password.setAttribute("type", "password");
    checked = 0;
  }
}

// classificação na página inicial
function mountTable() {
  Actions.refTable("demo")
    .orderByChild("pontuacao")
    .once("value", function(data) {
      // esconde a imagem ao finalizar o request do banco de dados
      $("#loading").css("display", "none");

      drivers = orderArray(data.val());
      var colocacao = 0;
      drivers.forEach(function(i) {
        colocacao += 1;
        text =
          "<tr><td>" +
          colocacao +
          "</td><td>" +
          i.nome +
          "</td> <td> " +
          i.equipe +
          "</td> <td>" +
          i.pontuacao +
          " </td></tr>";
        tabela.append(text);
      });
    });
}

//classficacão na página do Admin
function mountTableDash() {
  var colocacao = 0;
  Actions.refTable("demo")
    .once("value")
    .then(function(data) {
      // esconde a imagem ao finalizar o request do banco de dados
      $("#loading").css("display", "none");
      driversData = [];
      var index = 0;
      for (i in data.val()) {
        driversData.push(data.val()[i]);
        driversData[index]["pk"] = i;
        console.log(driversData);
        index++;
        //console.log(i);
        //for (j = 0; j < drivers.length; j++) {
        //  if (data.val()[i]["pontuacao"] == drivers[j]["pontuacao"]) {
        //    drivers[j]["pk"] = i;
        //  }
        //}
      }
      drivers = orderArray(driversData);

      drivers.forEach(function(i) {
        text = `<tr>
                  <td>${(colocacao += 1)}</td>
                  <td>${i.nome}</td>
                  <td>${i.equipe}</td>
                  <td>${i.pontuacao}</td>
                  <td>
                    <button class="btn btn-primary" onclick="editDriver('${
                      i.pk
                    }',this)">editar</button>
                    <button class="btn btn-danger" onclick="deleteDriver('${
                      i.pk
                    }',this)">excluir</button>
                  </td>
                </tr>`;
        tabela.append(text);
      });
    });
}

function showAddDialog(buttonValue = "Cadastrar") {
  $("#form-submit").val(buttonValue);
  $("#piloto").val("");
  $("#equipe").val("");
  $("#pontuacao").val("");
  $("#my-modal").css("display", "inline");
  $(".container-fluid")
    .first()
    .css("opacity", "0.1");
  $("body").css("background", "rgba(0,0,0,0.9)");
}

function showSiteAgain() {
  //configura o formulário como formulário de criação de usuários
  $("#form-action").val("create");
  $("#my-modal").css("display", "none");
  $(".container-fluid").css("opacity", "1");
  $("body").css("background", "#fff");
}

function addDriver() {
  formAction = $("#form-action").val();
  nome = $("#piloto").val();
  equipe = $("#equipe").val();
  pontuacao = $("#pontuacao").val();
  if (formAction == "create") {
    Actions.refTable("demo").push({
      nome: nome,
      equipe: equipe,
      pontuacao: pontuacao
    });
    $("#piloto").val("");
    $("#equipe").val("");
    $("#pontuacao").val("");
  } else {
    Actions.refTable("demo/", driver_id).set({
      nome: nome,
      equipe: equipe,
      pontuacao: pontuacao
    });
  }
}

function editDriver(id_driver, element) {
  driver_id = id_driver;
  formAction = "uppastDate";
  $("#form-action").val(formAction);
  showAddDialog("Atualizar");
  cells = element.parentElement.parentElement.cells;
  nome = cells[1].innerHTML;
  equipe = cells[2].innerHTML;
  pontuacao = cells[3].innerHTML;
  $("#piloto").val(nome);
  $("#equipe").val(equipe);
  $("#pontuacao").val(pontuacao);
  //colocar os valores dentro do dialogo
}

function deleteDriver(id_driver, element) {
  element.parentElement.parentElement.innerHTML = "";
  Actions.refTable("demo", id_driver).set(null);
}

function orderArray(array, id = "undefined") {
  sort_array = [];
  obj_array = Object.values(array);
  index = 0;
  obj_array.forEach(function(i) {
    sort_array.push(i.pontuacao);
    if (id != "undefined") i.pk = id;
  });
  sort_array.sort(function(a, b) {
    return b - a;
  });

  return new Set(searchArray(obj_array, sort_array));
}

function searchArray(arr, value) {
  response_array = [];
  for (i = 0; i < value.length; i++) {
    for (j = 0; j < arr.length; j++) {
      if (value[i] == arr[j]["pontuacao"]) {
        response_array.push(arr[j]);
      }
    }
  }
  return response_array;
}

page = window.location.href.split("/").pop();
switch (page) {
  case "":
  case "index.html":
  case "#":
    mountTable();
    datePassed();
    break;
  case "dashboard.html":
  case "dashboard.html#":
    Actions.authUser();
    mountTableDash();
    break;

  default:
    break;
}

function toogleCalendar() {
  if ($("#calendar").css("display") == "none") {
    $("#calendar").css("display", "block");
    $("#calendar").removeClass("fade-in fade-out");
    $("#calendar").addClass("fade-in");
    $("#calendar>table").removeClass("fade-in-table fade-out-table");
    $("#calendar>table").addClass("fade-in-table");
  } else {
    $("#calendar").removeClass("fade-in");
    $("#calendar").addClass("fade-out");
    $("#calendar>table").removeClass("fade-in-table");
    $("#calendar>table").addClass("fade-out-table");
    $("#calendar-button").fadeIn();
    setTimeout(function() {
      $("#calendar").css("display", "none");
    }, 2100);
    //    $('#calendar>table').addClass('fade-out-table');
  }
}

$("#calendar-button").click(() => {
  largura = $(window).width();
  visibility = $("#calendar-button").css("visibility");
  if (largura < 576 && visibility == "visible") {
    $("#calendar-button").fadeOut();
  }
});

function createUser(email, password) {
  AuthObj = firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .catch(function(error) {
      console.log(error);
    });
}

function loginAdmin() {
  email = $("#email").val();
  password = $("#password").val();
  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION)
    .then(function() {
      return firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(function() {
          window.location.href = "dashboard.html";
        })
        .catch(function() {
          alert("email ou senha incorretos");
        });
    })
    .catch(function(error) {
      console.log("não foi possível autenticar devido ao erro" + error);
    });

  return false;
}

function logout() {
  firebase.auth().signOut();
}

function authUser() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      console.log("não é possível autenticar esse usuário");
      window.location.href = "index.html";
    }
  });
}

function datePassed() {
  tableNode = $("#calendar>table>tbody>tr>td");
  tableRow = $("#calendar>table>tbody>tr");
  currentDate = new Date().valueOf();

  tableRow.each(function() {
    parsedDate = $(this.cells[1])[0]
      .innerHTML.split("/")
      .reverse();

    pastDate = new Date(
      parseInt(parsedDate[0]),
      parseInt(parsedDate[1]) - 1,
      parseInt(parsedDate[2])
    ).valueOf();

    if (pastDate < currentDate) {
      $(this).addClass("day-passed");
    } else {
      $(this).css("background", "#378836");
      $(this).css("color", "white");
      return false;
    }
  });
}
