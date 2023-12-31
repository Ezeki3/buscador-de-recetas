function iniciarApp() {

  const selectCategorias = document.querySelector('#categorias');
  const resultado = document.querySelector('#resultado');

  if (selectCategorias) {
    selectCategorias.addEventListener('change', seleccionarCategorias);
    obtenerCategorias();
  }

  const favoritosDiv = document.querySelector('.favoritos');
  if (favoritosDiv) {
    obtenerFavoritos();
  }

  const modal = new bootstrap.Modal('#modal', {});

  function obtenerCategorias() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultado => {
        mostrarCategorias(resultado.categories);
      })
  }

  function mostrarCategorias(categorias = []) {

    categorias.forEach(categoria => {
      const { strCategory } = categoria

      const option = document.createElement('OPTION');
      option.value = strCategory
      option.textContent = strCategory
      selectCategorias.appendChild(option)
    })
  }

  function seleccionarCategorias(e) {
    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
    fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultado => mostrarRecetas(resultado.meals))
  }

  function mostrarRecetas(recetas = []) {

    limpiarHtml(resultado);

    const heading = document.createElement('H2');
    heading.classList.add('text-center', 'text-black', 'my-3');
    heading.textContent = recetas.length ? 'Resultados' : 'No hay resultados';
    resultado.appendChild(heading);

    // iterar en los resultados
    recetas.forEach(receta => {
      const { idMeal, strMeal, strMealThumb } = receta;

      const recetaContenedor = document.createElement('DIV');
      recetaContenedor.classList.add('col-md-4');

      const recetaCard = document.createElement('DIV');
      recetaCard.classList.add('card', 'mb-4');

      const recetaImagen = document.createElement('IMG');
      recetaImagen.classList.add('card-img-top');
      recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
      recetaImagen.src = strMealThumb ?? receta.img;

      const recetaCardBody = document.createElement('DIV');
      recetaCardBody.classList.add('card-body');

      const recetaHeading = document.createElement('H3');
      recetaHeading.classList.add('card-title', 'mb-3');
      recetaHeading.textContent = strMeal ?? receta.titulo;

      const recetaButton = document.createElement('BUTTON');
      recetaButton.classList.add('btn', 'btn-danger', 'w-100');
      recetaButton.textContent = 'Ver receta';
      // recetaButton.dataset.bsTarget = "#modal";//conectamos con el modal del html
      // recetaButton.dataset.bsToggle = "modal";

      recetaButton.onclick = function () {
        seleccionarReceta(idMeal ?? receta.id);
      }

      // Inyectamos el codigo generado al HTML
      recetaCardBody.appendChild(recetaHeading);
      recetaCardBody.appendChild(recetaButton);

      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);

      recetaContenedor.appendChild(recetaCard);

      // metemos todo el codigo generado, dentro del div de resultado que ya teniamos creado en el HTML
      resultado.appendChild(recetaContenedor);

    })
  }

  function seleccionarReceta(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultado => mostrarRecetaModal(resultado.meals[0]))
  }

  function mostrarRecetaModal(receta) {

    const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

    // Añadimos el contenido al modal
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');

    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
      <h3 class="my-3">Instrucciones</h3>
      <p>${strInstructions}</p>
      <h3 class="my-3">Ingredientes y Cantidades</h3>
    `;

    const listGroup = document.createElement('UL');
    listGroup.classList.add("list-group");
    // Mostramos cantidades e ingredientes
    for (let i = 1; i <= 20; i++) { // ITERAMOS SOBRE CADA UNO DE SUS ELEMENTOS

      if (receta[`strIngredient${i}`]) {
        const ingrediente = receta[`strIngredient${i}`];
        const cantidad = receta[`strMeasure${i}`];
        
        const ingredienteLi = document.createElement('LI');
        ingredienteLi.classList.add('list-group');
        ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

        listGroup.appendChild(ingredienteLi);
      }

    }
    modalBody.append(listGroup);

    const modalFooter = document.querySelector('.modal-footer');
    limpiarHtml(modalFooter); //limpiamos antes de que se generen mas elementos

    // Botones de favoritos y cerrar
    const btnFavorito = document.createElement('BUTTON');
    btnFavorito.classList.add('btn', 'btn-danger',  'col');
    btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';
    
    // localStorage
    btnFavorito.onclick = function(){

      if (existeStorage(idMeal)) {
        eliminarFavoritos(idMeal)
        btnFavorito.textContent = 'Guardar Favorito';
        // si ya existe el id con el return, impedimos que se siga ejecutando el demas codigo
        mostrarToast('Eliminado correctamente!')
        return
      }

      // Pasamos un objeto a la funcion
      agregarFavorito({
        id: idMeal,
        title: strMeal,
        img: strMealThumb,
      })
      btnFavorito.textContent = 'Eliminar Favorito';
      mostrarToast('Guardado Correctamente!');
    }


    const btnCerrarModal = document.createElement('BUTTON');
    btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
    btnCerrarModal.textContent = 'Cerrar';
    btnCerrarModal.onclick = function() { //lo hacemos con el callback para esperar a que ocurra el evento
      modal.hide();
    }

    modalFooter.appendChild(btnFavorito);
    modalFooter.appendChild(btnCerrarModal);

    // Mostrar el modal
    modal.show()
  }

  function agregarFavorito(receta){
    // asigna un elemento y guardalo en favoritos y si no existe guarda un arreglo vacio
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));

    if(favoritosDiv){
      obtenerFavoritos();
    }
  }

  function eliminarFavoritos(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos',JSON.stringify(nuevosFavoritos));

    if(favoritosDiv){
      obtenerFavoritos();
    }

  }

  function existeStorage(id){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    return favoritos.some(favorito => favorito.id === id);
  }

  function mostrarToast(mensaje){
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = mensaje;
    toast.show();
  }

  function obtenerFavoritos(){
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    if (favoritos.length) {
      mostrarRecetas(favoritos);
      return
    }

    const noFavoritos = document.createElement('P');
    noFavoritos.textContent = 'No hay favoritos aún...';
    noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-3');
    favoritosDiv.appendChild(noFavoritos);
  }

  function limpiarHtml(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }

}

document.addEventListener('DOMContentLoaded', iniciarApp);