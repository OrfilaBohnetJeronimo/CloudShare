// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC_CWcbLqcCc-1gFqrQ7pnFCDFg5AwJ9do",
    authDomain: "snapshare-12e55.firebaseapp.com",
    databaseURL: "https://snapshare-12e55-default-rtdb.firebaseio.com",
    projectId: "snapshare-12e55",
    storageBucket: "snapshare-12e55.appspot.com",
    messagingSenderId: "586012490975",
    appId: "1:586012490975:web:84a11d8c21b47640877d6a",
    measurementId: "G-7VEWEN7MKM"
};
firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const storage = firebase.storage();

// Función para crear una publicación
function createPost() {
    const username = document.getElementById('username').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const image = document.getElementById('image').files[0];

    if (username && title && content) {
        const postRef = database.ref('posts').push();
        const postId = postRef.key;

        if (image) {
            const storageRef = storage.ref('images/' + postId + '/' + image.name);
            storageRef.put(image).then(snapshot => {
                snapshot.ref.getDownloadURL().then(url => {
                    postRef.set({
                        username: username,
                        title: title,
                        content: content,
                        imageUrl: url
                    });
                });
            });
        } else {
            postRef.set({
                username: username,
                title: title,
                content: content
            });
        }
    }
}

// Vincular la función createPost al botón de publicar
document.getElementById('publishButton').addEventListener('click', createPost);

// Función para eliminar una publicación
function deletePost(postId) {
    if (confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
        database.ref('posts/' + postId).remove();
        document.getElementById(postId).remove();
    }
}

// Función para agregar comentarios
function addComment(postId) {
    const commentText = document.getElementById(`comment-${postId}`).value;
    const commentRef = database.ref(`posts/${postId}/comments`).push();

    if (commentText) {
        commentRef.set({
            text: commentText
        });
    }
}

// Función para cargar y mostrar comentarios
function loadComments(postId) {
    database.ref(`posts/${postId}/comments`).on('child_added', snapshot => {
        const comment = snapshot.val();
        const commentHtml = `<p>${comment.text}</p>`;
        document.getElementById(`comments-${postId}`).insertAdjacentHTML('beforeend', commentHtml);
    });
}

// Función para crear el elemento de una publicación
function createPostElement(postId, post) {
    const postHtml = `
        <div class="post" id="${postId}">
            <h3>${post.title}</h3>
            <p>Publicado por: ${post.username}</p>
            <p>${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagen">` : ''}
            <button class="delete" onclick="deletePost('${postId}')">Eliminar</button>
            <div class="comments" id="comments-${postId}"></div>
            <textarea id="comment-${postId}" class="comment-box" placeholder="Escribe un comentario"></textarea>
            <button onclick="addComment('${postId}')">Comentar</button>
        </div>
    `;
    document.getElementById('posts').insertAdjacentHTML('beforeend', postHtml);
}

// Cargar y mostrar publicaciones
database.ref('posts').on('child_added', snapshot => {
    const postId = snapshot.key;
    const post = snapshot.val();
    createPostElement(postId, post);
    loadComments(postId);
});
