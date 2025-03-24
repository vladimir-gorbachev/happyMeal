document.addEventListener('DOMContentLoaded', function () {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => console.error('Erreur lors du chargement du footer:', error));
});
