const socket = io();

const form = document.getElementById('productForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  socket.emit('nuevoProducto', data);

  // vaciar el formulario visualmente
  form.reset();
});

const deleteForm = document.getElementById('deleteForm');
deleteForm.addEventListener('submit', e => {
  e.preventDefault();
  const { id } = Object.fromEntries(new FormData(deleteForm));
  socket.emit('eliminarProducto', id);

  // vaciar el campo de ID
  deleteForm.reset();
});

socket.on('productosActualizados', products => {
  const ul = document.getElementById('productList');
  ul.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `${p.title} - $${p.price} <button onclick="deleteProduct('${p.id}')">Eliminar</button>`;
    ul.appendChild(li);
  });

  const msg = document.createElement('p');
  msg.innerText = 'Lista actualizada';
  msg.style.color = 'green';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
});

//funcion de eliminar
function deleteProduct(id) {
  socket.emit('eliminarProducto', id);
}
