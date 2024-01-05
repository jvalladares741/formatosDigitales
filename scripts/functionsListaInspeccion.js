/*colocar fecha en base al reloj del sistema, dentro de la casilla 'fecha'*/
let cargarFecha = () => {
  let fecha = document.getElementById("fecha");
  dia = new Date().toLocaleDateString();
  fecha.value = dia;
};
cargarFecha();
/*colocar fecha end*/

//obtener los datos del archivo
//uso de una petición fetch
fetch("../scripts/datos.json")
  .then((response) => response.json())
  .then((data) => {
    //la data obtenida será nombrada como users
    users = data;
    /*Autocompletado y llenado para los técnicos*/
    //llena las opciones de 'participantes tecnicos' del primer select que aparecerá por defecto
    //funcion
    llenarSelect(document.querySelector(".trabajador-nombre"));
    autocompletarCampos(
      document.querySelector(".trabajador-nombre"),
      document.querySelector(".contenedor-nombre")
    );

    //llena el select del responsable del proyecto
    llenarSelect(document.getElementById("responsable-nombre"));
    autocompletarCamposResponsable(
      document.getElementById("responsable-nombre"),
      document.getElementById("firma-responsable")
    );
  })
  .catch((error) => console.error("Error al cargar los datos:", error));

// Función para llenar el select con opciones de nombres de los técnicos
function llenarSelect(elementoSelect) {
  //una vez con la data 'users' obtenida se podrá acceder a cada uno de los elementos dentro de ella
  users.tecnico.forEach((tecnico) => {
    const option = document.createElement("option");
    option.value = tecnico.name;
    option.textContent = tecnico.name;
    elementoSelect.appendChild(option);
  });
}

//autocompletar el select ya creado
function autocompletarCampos(elementoSelect, datosParticipante) {
  elementoSelect.addEventListener("change", function () {
    const nombreSeleccionado = elementoSelect.value;
    const usuarioSeleccionado = users.tecnico.find(
      (tecnico) => tecnico.name === nombreSeleccionado
    );
    datosParticipante.querySelector(".trabajador-dni").value =
      usuarioSeleccionado.dni;
    datosParticipante.querySelector(".trabajador-firma").value =
      usuarioSeleccionado.firma;
  });
}

/*Autocompletado del responsable*/
function autocompletarCamposResponsable(elementoSelect, datosResponsable) {
  elementoSelect.addEventListener("change", function () {
    const nombreSeleccionado = elementoSelect.value;
    const responsableSeleccionado = users.tecnico.find(
      (tecnico) => tecnico.name === nombreSeleccionado
    );
    //autocompletar los campos correspondientes
    datosResponsable.value = responsableSeleccionado.firma;
  });
}

/*Agregar Persona*/

let btnAgregarPersonal = document.querySelector(".agregar-personal");
let btnGenerar = document.querySelector(".terminar");

/*el btnAgregarPersonal ejecutará la función respectiva y al mismo tiempo también posee un contador
, este servirá para evitar que los radio button creados tengan el mismo nombre que los anteriores*/
let numUser = 1;
btnAgregarPersonal.addEventListener("click", function () {
  //solo permitirá la creación de  usuarios
  if (numUser < 5) {
    agregarContenedorPersona(numUser);
    // todo lo correspondiente a selectores sirve como autocompletado para todos los selects clonados
    // ya que la función normal de autocompletado solo se ejecuta con los elementos creados por default
    let selectores = document.querySelectorAll(".trabajador-nombre");
    selectores.forEach((selectorNombre) => {
      selectorNombre.addEventListener("change", function (event) {
        const nombreSeleccionado = selectorNombre.value;
        const usuarioSeleccionado = users.tecnico.find(
          (tecnico) => tecnico.name === nombreSeleccionado
        );
        const contenedor = event.target.closest(".contenedor-nombre");

        contenedor.querySelector(".trabajador-dni").value =
          usuarioSeleccionado.dni;
        contenedor.querySelector(".trabajador-firma").value =
          usuarioSeleccionado.firma;
      });
    });
    numUser += 1;
  } else {
    alert("Ha alcanzado el número máximo de participantes");
  }
});

//funcion para agregar personal al listado
function agregarContenedorPersona(numUser) {
  alert("Se añadió un nuevo participante, completar sus datos correctamente");
  // Clona el contenedor-trabajador
  const contenedorTrabajador = document.querySelector(".contenedor-trabajador");
  const nuevoContenedor = contenedorTrabajador.cloneNode(true);
  nuevoContenedor.classList.add("clon");

  // itera sobre los radio buttons que aparecerán dentro del nuevo contenedor de usuarios y cambia sus atributos "name"
  // ya que los radio buttons deben tener nombres específicos
  nuevoContenedor
    .querySelectorAll('input[type="radio"]')
    .forEach((radioButton) => {
      const originalName = radioButton.getAttribute("name");
      const newName = `${originalName}-${numUser}`;
      radioButton.setAttribute("name", newName);
    });

  document.querySelector(".section-todo-personal").appendChild(nuevoContenedor);
  /*se debe revisar la manera de hacer que cuando se realice la clonación 
    el resto de contenedores tengan también sus inputs en en NA
    de esta manera se evitará inconvenientes.
    */
}

/*---- PARTE 2 DEL CÓDIGO ----*/
/* cargar documento */
//Constante que permitirá usar el objeto jspdf
const jsPDF = window.jspdf.jsPDF;

//creación de los tamaños para el texto en el documento
//fontSizeTexo es importante definirla porque es el tamaño de fuente que aarecereá en el pdf
const fontSizeTexto = 10;

/*Función para cargar la imagen pdf que se usará como plantilla para rellenar con datos del formulario*/
async function loadImage(url) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function (e) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const res = event.target.result;
        resolve(res);
      };
      const file = this.response;
      reader.readAsDataURL(file);
    };
    xhr.send();
  });
}

btnGenerar.addEventListener("click", async function generarPDF(e) {
  e.preventDefault();
  //doc, objeto}
  //dimensiones del documento pdf
  var doc = new jsPDF("p", "mm", [666, 943]);
  //imagen del documento vacía
  const image = await loadImage("../recursos/formatoListaInspeccion.png");
  //colocar la imagen
  //colocar imagen desde una posicion en especifico, con las dimensiones especificas
  doc.addImage(image, "PNG", 0, 0, 666, 943);

  doc.setFontSize(15);

  //funcion para obtener y evaluar datos de la empresa
  let evaluarEmpresa = () => {
    /*Seleccionar empresa start*/
    let empresa = document.getElementById("empresa");
    /*Seleccionar empresa end*/

    /*EMPRESA SELECCIONADA */
    switch (empresa.value) {
      //La validación se da en el primer caso
      //si el valor del input es seleccionar se returna un valor falso
      //esto redirige el flujo al final del código
      case "- Seleccionar -":
        alert("Complete la sección de Empresa");
        return false;
      case "TECHING":
        doc.text("X", 74.5, 45);
        break;
      case "CONTRATISTA1":
        doc.text("X", 184.5, 45.4);
        doc.text(empresa.value, 225, 45);
        break;
      case "CONTRATISTA2":
        doc.text("X", 184.5, 45.4);
        doc.text(empresa.value, 225, 45);
        break;
    }
    return true;
  };

  //funcion para obtener y colocar datos de la parte superior e inferior con firma del responsable
  let evaluarDatosPrincipales = () => {
    let trabajo = document.getElementById("trabajo").value;
    let lugar = document.getElementById("lugar").value;
    let fecha = document.getElementById("fecha").value;
    let hora = document.getElementById("hora").value;
    let responsable1 = document.getElementById("responsable-nombre").value;
    let responsableFirma = document.getElementById("firma-responsable").value;

    if (trabajo != "" && lugar != "" && responsable1 != "") {
      doc.text(trabajo, 150, 55);
      doc.text(lugar, 95, 65);
      doc.text(fecha, 95, 75);
      doc.text(hora, 200, 75);
      doc.text("Bernabe Oscco León", 380, 70);

      //tecnico responsable
      doc.text(responsable1, 250, 876.5, {align: "center"})
      doc.addImage(responsableFirma, "PNG", 217, 850, 80, 20);

      
      /*nombre supervisor*/
      /*La firma del supervisor estará siendo colocada desde aquí*/
      /*firma supervisor*/
      //En caso sea necesario, esta es la firma para el supervisor
      //se debería de crear un input en el html y una variable para obtener su nombre
      //y con ello también su firma, similar a como se hace con el resto, pero una única vez
      let supervisorNombre = "Roberto Carlos Luis Bailon"
      let supervisorFirma = "https://raw.githubusercontent.com/jvalladares741/formatosDigitales/main/recursos/firmas/RobertoLuisBailon.png"
      doc.text(supervisorNombre, 445, 876.5);
      //modificar por la firma de roberto carlos luis bailon
      doc.addImage(supervisorFirma, "PNG", 440, 850, 80, 20);
      //para que aparezca el nombre y la firma

      return true;
    } else {
      alert("Complete todos los campos de la parte superior del formulario");
      return false;
    }
  };

  //colocar comentarios
  comentarios = document.getElementById("comentarios").value;
  doc.text(comentarios, 90, 830, {
    maxWidth: 510,
    lineHeightFactor: 2,
  });

  //INICIA COLOCAR CARGOS Y NOMBRES
  function evaluarNombreCargo() {
    let resEvalNombreCargo = true;
    let cargos = document.querySelectorAll(".trabajador-cargo");
    let nombres = document.querySelectorAll(".trabajador-nombre");
    let firmas = document.querySelectorAll(".trabajador-firma");
    let dnis = document.querySelectorAll(".trabajador-dni");
    doc.setFontSize(13);

    //colocar cargos
    //altura de 90 es buena para los cargos
    //X DE 222 también es buena
    let cargosX = 280;
    let contador = 0;
    cargos.forEach((cargo) => {
      if (cargo.value != "") {
        if (contador != 0) {
          doc.text(cargo.value, cargosX, 88);
          cargosX += 60;
        } else {
          doc.text(cargo.value, 237, 88);
          contador = 1;
        }
        return true;
      } else {
        alert("Complete todos los cargos del peronal evaluado");
        resEvalNombreCargo = false;
        return;
      }
    });

    //colocar nombres
    let nombresX1 = 280;
    let contadorn = 0;
    nombres.forEach((nombre) => {
      if (nombre.value != "") {
        if (contadorn != 0) {
          doc.text(nombre.value, nombresX1, 95, {
            align: "center",
            maxWidth: 30,
            lineHeightFactor: 0.8,
          });
          nombresX1 += 60;
        } else {
          doc.text(nombre.value, 237.5, 95, {
            align: "center",
            maxWidth: 20,
            lineHeightFactor: 0.8,
          });
          contadorn = 1;
        }
      } else {
        alert("Complete todos los nombres del peronal evaluado");
        resEvalNombreCargo = false;
        return;
      }
    });

    //colocarFirmas
    let firmasX = 150;
    firmas.forEach((firma) => {
      doc.addImage(firma.value, "PNG", firmasX, 805, 60, 15);
      firmasX += 100;
    });

    //colocarDNI
    let dnisX = 213;
    dnis.forEach((dni) => {
      doc.text(dni.value, dnisX, 813);
      dnisX += 100;
    });

    if (resEvalNombreCargo) {
      return true;
    } else {
      return false;
    }
  }

  //TERMINA COLOCAR CARGOS Y NOMBRES

  //CONTENEDORES DE LOS ELEMENTOS A EVALUAR
  //se obtiene todos los contenedores epp
  let epp = document.querySelectorAll(".contenedor-EPP");
  //se obtiene todos los contenedores herramientas
  let herramientas = document.querySelectorAll(".contenedor-herramientas");
  //se obtiene todos los contenedores equipos
  let equipos = document.querySelectorAll(".contenedor-equipos");
  //se obtiene todos los contenedores señalizacion
  let senializacion = document.querySelectorAll(".contenedor-senializacion");
  //se obtiene todos los contenedores documentacion
  let documentacion = document.querySelectorAll(".contenedor-documentacion");
  //se obtienen todos los accesorios
  let accesorios = document.querySelectorAll(".contenedor-accesorios");

  /*revisión de los select*/
  doc.setFontSize(15);
  //EPP
  //posicionamiento inicial
  positionSelectX = 206;
  positionSelectY = 125.8;
  epp.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    selectsEvaluar = e.querySelectorAll("select");
    //se evalua a cada input
    selectsEvaluar.forEach((se) => {
      //si el input ha sido marcado
      //if(se.checked){
      //se obtendrá su valor y se colocará en el documento
      doc.text(se.value, positionSelectX, positionSelectY);
      //la posicion y aumenta para completar el resto de elementos
      positionSelectY += 10.3;
      //}
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionSelectX += 60;
    positionSelectY = 125.8;
  });

  //HERRAMIENTAS
  //posicionamiento inicial
  positionSelectX = 206;
  positionSelectY = 341;
  herramientas.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    selectsEvaluar = e.querySelectorAll("select");
    //se evalua a cada input
    selectsEvaluar.forEach((se) => {
      //si el input ha sido marcado
      //if(se.checked){
      //se obtendrá su valor y se colocará en el documento
      doc.text(se.value, positionSelectX, positionSelectY);
      //la posicion y aumenta para completar el resto de elementos
      positionSelectY += 9.8;
      //}
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionSelectX += 60;
    positionSelectY = 341;
  });

  //EQUIPOS
  //posicionamiento inicial
  positionSelectX = 206;
  positionSelectY = 587;
  equipos.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    selectsEvaluar = e.querySelectorAll("select");
    //se evalua a cada input
    selectsEvaluar.forEach((se) => {
      //si el input ha sido marcado
      //if(se.checked){
      //se obtendrá su valor y se colocará en el documento
      doc.text(se.value, positionSelectX, positionSelectY);
      //la posicion y aumenta para completar el resto de elementos
      positionSelectY += 9.8;
      //}
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionSelectX += 60;
    positionSelectY = 587;
  });

  //SEÑALIZACION
  //posicionamiento inicial
  positionSelectX = 206;
  positionSelectY = 704;
  senializacion.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    selectsEvaluar = e.querySelectorAll("select");
    //se evalua a cada input
    selectsEvaluar.forEach((se) => {
      //si el input ha sido marcado
      //if(se.checked){
      //se obtendrá su valor y se colocará en el documento
      doc.text(se.value, positionSelectX, positionSelectY);
      //la posicion y aumenta para completar el resto de elementos
      positionSelectY += 9.8;
      //}
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionSelectX += 60;
    positionSelectY = 704;
  });

  //DOCUMENTACION
  //posicionamiento inicial
  positionSelectX = 206;
  positionSelectY = 734;
  documentacion.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    selectsEvaluar = e.querySelectorAll("select");
    //se evalua a cada input
    selectsEvaluar.forEach((se) => {
      //si el input ha sido marcado
      //if(se.checked){
      //se obtendrá su valor y se colocará en el documento
      doc.text(se.value, positionSelectX, positionSelectY);
      //la posicion y aumenta para completar el resto de elementos
      positionSelectY += 9.8;
      //}
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionSelectX += 60;
    positionSelectY = 734;
  });

  /*revisión de los inputs*/

  //EPP
  //posicionamiento inicial
  positionX = 235;
  positionY = 125.8;
  //recore todos los contenedores epp
  epp.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    inputsEvaluar = e.querySelectorAll("input");
    //se evalua a cada input
    inputsEvaluar.forEach((ie) => {
      //si el input ha sido marcado
      if (ie.checked) {
        //se obtendrá su valor y se colocará en el documento
        doc.text(ie.value, positionX, positionY);
        //la posicion y aumenta para completar el resto de elementos
        positionY += 10.3;
      }
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionX += 60;
    positionY = 125.8;
  });

  //HERRAMIENTAS
  //posicionamiento inicial
  positionX = 235;
  positionY = 341;
  //recore todos los contenedores epp
  herramientas.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    inputsEvaluar = e.querySelectorAll("input");
    //se evalua a cada input
    inputsEvaluar.forEach((ie) => {
      //si el input ha sido marcado
      if (ie.checked) {
        //se obtendrá su valor y se colocará en el documento
        doc.text(ie.value, positionX, positionY);
        //la posicion y aumenta para completar el resto de elementos
        positionY += 9.8;
      }
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionX += 60;
    positionY = 341;
  });

  //EQUIPOS
  //posicionamiento inicial
  positionX = 235;
  positionY = 587;
  //recore todos los contenedores epp
  equipos.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    inputsEvaluar = e.querySelectorAll("input");
    //se evalua a cada input
    inputsEvaluar.forEach((ie) => {
      //si el input ha sido marcado
      if (ie.checked) {
        //se obtendrá su valor y se colocará en el documento
        doc.text(ie.value, positionX, positionY);
        //la posicion y aumenta para completar el resto de elementos
        positionY += 9.8;
      }
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionX += 60;
    positionY = 587;
  });

  //SEÑALIZACION
  //posicionamiento inicial
  positionX = 235;
  positionY = 704;
  //recore todos los contenedores epp
  senializacion.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    inputsEvaluar = e.querySelectorAll("input");
    //se evalua a cada input
    inputsEvaluar.forEach((ie) => {
      //si el input ha sido marcado
      if (ie.checked) {
        //se obtendrá su valor y se colocará en el documento
        doc.text(ie.value, positionX, positionY);
        //la posicion y aumenta para completar el resto de elementos
        positionY += 9.8;
      }
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionX += 60;
    positionY = 704;
  });

  //DOCUMENTACIÓN
  //posicionamiento inicial
  positionX = 235;
  positionY = 734;
  //recore todos los contenedores epp
  documentacion.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    inputsEvaluar = e.querySelectorAll("input");
    //se evalua a cada input
    inputsEvaluar.forEach((ie) => {
      //si el input ha sido marcado
      if (ie.checked) {
        //se obtendrá su valor y se colocará en el documento
        doc.text(ie.value, positionX, positionY);
        //la posicion y aumenta para completar el resto de elementos
        positionY += 9.8;
      }
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionX += 60;
    positionY = 734;
  });

  //ACCESORIOS
  //posicionamiento inicial
  positionX = 218;
  positionY = 793;
  //recore todos los contenedores de accesorios
  accesorios.forEach((e) => {
    //se crea un array que contenga a todos los inputs
    //que se encontraban dentro de ese contenedor
    inputsEvaluar = e.querySelectorAll("input");
    //se evalua a cada input
    inputsEvaluar.forEach((ie) => {
      //si el input ha sido marcado
      if (ie.checked) {
        //se obtendrá su valor y se colocará en el documento
        doc.text(ie.value, positionX, positionY);
        //la posicion y aumenta para completar el resto de elementos
        //positionY+=9.8
      }
    });
    //al terminar con el primer contenedor se corre el sitio de impresion en 60
    //y vuelve el punto y a su lugar de inicio
    positionX += 60;
    //positionY = 734
  });

  if (evaluarEmpresa() && evaluarDatosPrincipales() && evaluarNombreCargo()) {
    /*var blob = doc.output("blob");
    window.open(URL.createObjectURL(blob));*/
    dia.replace("/","_")
    doc.save(`lista_inspeccion_${dia}.pdf`)
  } else {
    alert("Complete los campos solicitados para generar el documento");
  }
  //final
});