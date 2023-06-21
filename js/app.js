function iniciarApp() {

  const selectCategorias = document.querySelector('#categorias');
  selectCategorias.addEventListener('change', seleccionarCategorias);

  obtenerCategorias();

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

    // iterar en los resultados
    recetas.forEach(receta => {
      const recetaContenedor = document.createElement('DIV');
      recetaContenedor.classList.add('col-md-4');
      console.log(recetaContenedor);
    })
  }

}

document.addEventListener('DOMContentLoaded', iniciarApp);