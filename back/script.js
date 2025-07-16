const titleElement = document.getElementById("category-title");
const params = new URLSearchParams(window.location.search);
const newCategory = params.get("category"); // tshirt, hoodie, и т.д.

const categoryTitles = {
  bed: "Постельные принадлежности",
  bryuchki: "Брюки, Бриджи, Шорты",
  dresses: "Платья",
  hoodie: "Джемперы, Толстовки, Бомберы, Жилеты",
  komplekty: "Комплекты женские",
  male: "Для мужчин",
  nazapah: "Халаты на запах",
  pajamas: "Пижамные комплекты женские",
  pugovki: "Халаты на пуговицах",
  sorochki: "Пеньюары, Ночные сорочки",
  tshirt: "Майки, Футболки, Лонгсливы",
  zipka: "Халаты на молнии"
};

if (!newCategory) {
  alert("Категория не указана!");
  // можно сделать redirect на index.html
}



const productGrid = document.getElementById("product-grid");
  const pagination = document.getElementById("pagination");
  const modal = document.getElementById("modal");
  const modalName = document.getElementById("modal-name");
  const modalPrice = document.getElementById("modal-price");
  const modalDescription = document.getElementById("modal-description");
  const mediaDisplay = document.getElementById("media-display");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const modalClose = document.getElementById("modal-close");

  const openBookmarksBtn = document.getElementById("open-bookmarks");
  const bookmarksModal = document.getElementById("bookmarks-modal");
  const closeBookmarksBtn = document.getElementById("close-bookmarks");
  const bookmarkCount = document.getElementById("bookmark-count");
  const bookmarksItems = document.getElementById("bookmarks-items");
  const bookmarksEmpty = document.getElementById("bookmarks-empty");

  let products = [];             // все товары
  let filteredProducts = [];     // товары текущей категории
  let currentCategory = null;    // выбранная категория
  let currentPage = 1;
  const productsPerPage = 9;
  let totalPages = 0;
  let currentProductIndex = 0;
  let currentImageIndex = 0;
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
  updateBookmarkCount();

  async function loadProducts() {
    const files = [
      { file: 'data/bed.json', category: 'bed' },
      { file: 'data/bryuchki.json', category: 'bryuchki' },
      { file: 'data/dresses.json', category: 'dresses' },
      { file: 'data/hoodie.json', category: 'hoodie' },
      { file: 'data/komplekty.json', category: 'komplekty' },
      { file: 'data/male.json', category: 'male' },
      { file: 'data/nazapah.json', category: 'nazapah' },
      { file: 'data/pajamas.json', category: 'pajamas' },
      { file: 'data/pugovki.json', category: 'pugovki' },
      { file: 'data/sorochki.json', category: 'sorochki' },
      { file: 'data/tshirt.json', category: 'tshirt' },
      { file: 'data/zipka.json', category: 'zipka' }
    ];

    try {
     const allData = await Promise.all(
  files.map(async (f) => {
    try {
      const res = await fetch(f.file);
      if (!res.ok) throw new Error(`Файл не найден: ${f.file}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn(err.message);
      return []; // Пустой массив для пропущенного файла
    }
  })
);

      // Присваиваем каждому товару категорию
      products = allData.flatMap((arr, i) =>
        arr.map(p => ({ ...p, category: files[i].category }))
      );

      // Сортируем по статусу
      products.sort((a, b) => {
        const order = { new: 0, old: 1, out: 2 };
        return order[a.status] - order[b.status];
      });

      // Выставляем начальную категорию (например, pajamas)
      setCategory(newCategory || 'index');

    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
    }
  }

  loadProducts();

  function setCategory(category) {
  currentCategory = category;
  filteredProducts = products.filter(p => p.category === category);
  totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  currentPage = 1;

  if (categoryTitles[category]) {
    titleElement.textContent = categoryTitles[category];
  } else {
    titleElement.textContent = "Категория не найдена";
  }

  renderPage();
}


function showSwipeHintOnce() {
  if (localStorage.getItem('swipeHintShown')) return;

  const hint = document.getElementById('swipe-hint');
  if (!hint) return;

  hint.style.display = 'block';
  localStorage.setItem('swipeHintShown', 'true');

  // Через 3 секунды убираем подсказку
  setTimeout(() => {
    swipeHint.remove();
  }, 3000);
}


function animateSliderImageChange(imgElement, newSrc) {
  imgElement.style.transition = "opacity 0.3s ease";
  imgElement.style.opacity = 0;
  setTimeout(() => {
    imgElement.src = newSrc;
    imgElement.style.opacity = 1;
  }, 300);
}


  function renderPage() {
    productGrid.innerHTML = "";
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const visibleProducts = filteredProducts.slice(start, end);

    visibleProducts.forEach(product => {
      const productCard = document.createElement("div");
      productCard.classList.add("product");

      // Если это первая карточка и подсказка ещё не показывалась
if (start === 0 && product === visibleProducts[0] && !localStorage.getItem('swipeCardHintShown')) {
  const swipeHint = document.createElement("div");
  swipeHint.className = "card-swipe-hint";
  swipeHint.textContent = "👆";
  productCard.appendChild(swipeHint);
  localStorage.setItem('swipeCardHintShown', 'true');
}

     

      const statusBadge = document.createElement("div");
      statusBadge.classList.add("status-badge", `status-${product.status}`);
      if (product.status === "new" || product.status === "out") {
        statusBadge.textContent = product.status === "new" ? "Новинка" : "Нет в наличии";
        productCard.appendChild(statusBadge);

      }

      // Создаём контейнер слайдера
const sliderContainer = document.createElement("div");
sliderContainer.classList.add("slider-container");

// Кнопки влево / вправо
const leftArrow = document.createElement("button");
leftArrow.classList.add("slider-arrow", "left");
leftArrow.textContent = "←";

const rightArrow = document.createElement("button");
rightArrow.classList.add("slider-arrow", "right");
rightArrow.textContent = "→";

// Создаём саму картинку
const sliderImage = document.createElement("img");
sliderImage.loading = "lazy";
sliderImage.src = product.images && product.images.length > 0 ? product.images[0] : "cat2.png";
sliderImage.classList.add("slider-image");

let currentImageIndex = 0;

// Свайп для телефона
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

sliderImage.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  isSwiping = false;
});

sliderImage.addEventListener("touchmove", (e) => {
  const touchMoveX = e.changedTouches[0].screenX;
  const touchMoveY = e.changedTouches[0].screenY;

  const diffX = Math.abs(touchMoveX - touchStartX);
  const diffY = Math.abs(touchMoveY - touchStartY);

  if (diffX > diffY) {
    isSwiping = true;
    e.preventDefault(); // Блокируем вертикальный скролл при горизонтальном свайпе
  }
});

sliderImage.addEventListener("touchend", (e) => {
  if (!isSwiping) return;
  const touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) < 30) return;

  if (diff > 0) {
    currentImageIndex = (currentImageIndex + 1) % product.images.length;
  } else {
    currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
  }

  animateSliderImageChange(sliderImage, product.images[currentImageIndex]);

});



// Листание влево / вправо
leftArrow.onclick = (e) => {
  e.stopPropagation();
  currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
  animateSliderImageChange(sliderImage, product.images[currentImageIndex]);

};

rightArrow.onclick = (e) => {
  e.stopPropagation();
  currentImageIndex = (currentImageIndex + 1) % product.images.length;
  animateSliderImageChange(sliderImage, product.images[currentImageIndex]);
};

// Добавляем в карточку
sliderContainer.appendChild(leftArrow);
sliderContainer.appendChild(sliderImage);
sliderContainer.appendChild(rightArrow);
productCard.appendChild(sliderContainer);

      const productName = document.createElement("div");
      productName.classList.add("product-name");
      productName.textContent = product.name;

      const productPrice = document.createElement("div");
      productPrice.classList.add("product-price");
      productPrice.textContent = product.price;

      const bookmarkBtn = document.createElement("button");
      bookmarkBtn.classList.add("bookmark-btn", bookmarks.includes(product.id) ? "remove" : "add");
      bookmarkBtn.textContent = bookmarks.includes(product.id) ? "Удалить из закладок" : "Добавить в закладки";

      bookmarkBtn.onclick = (e) => {
        e.stopPropagation();
        if (bookmarks.includes(product.id)) {
          bookmarks = bookmarks.filter(id => id !== product.id);
          bookmarkBtn.textContent = "Добавить в закладки";
          bookmarkBtn.classList.remove("remove");
          bookmarkBtn.classList.add("add");
        } else {
          bookmarks.push(product.id);
          bookmarkBtn.textContent = "Удалить из закладок";
          bookmarkBtn.classList.remove("add");
          bookmarkBtn.classList.add("remove");
        }
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        updateBookmarkCount();
      };

    
      productCard.appendChild(productName);
      productCard.appendChild(productPrice);
      productCard.appendChild(bookmarkBtn);

      productCard.onclick = () => {
        openModal(product);
      };

      productGrid.appendChild(productCard);
    });

    renderPagination();
  }

  function renderPagination() {
  pagination.innerHTML = "";
  const paginationContainer = document.createElement("div");
  paginationContainer.style.display = "flex";
  paginationContainer.style.alignItems = "center";
  paginationContainer.style.justifyContent = "center";

  // Кнопка Первая страница
  const firstButton = document.createElement("button");
  firstButton.textContent = "⏮";
  firstButton.disabled = currentPage === 1;
  firstButton.onclick = () => {
    currentPage = 1;
    renderPage();
  };
  paginationContainer.appendChild(firstButton);

  // Кнопка Назад
  const prevButton = document.createElement("button");
  prevButton.textContent = "← Назад";
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    currentPage--;
    renderPage();
  };
  paginationContainer.appendChild(prevButton);

  // Текущая страница
  const pageInfo = document.createElement("div");
  pageInfo.textContent = `${currentPage} из ${totalPages}`;
  pageInfo.style.margin = "0 10px";
  paginationContainer.appendChild(pageInfo);

  // Кнопка Вперёд
  const nextButton = document.createElement("button");
  nextButton.textContent = "Вперёд →";
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    currentPage++;
    renderPage();
  };
  paginationContainer.appendChild(nextButton);

  // Кнопка Последняя страница
  const lastButton = document.createElement("button");
  lastButton.textContent = "⏭";
  lastButton.disabled = currentPage === totalPages;
  lastButton.onclick = () => {
    currentPage = totalPages;
    renderPage();
  };
  paginationContainer.appendChild(lastButton);

  pagination.appendChild(paginationContainer);
}


  function updateBookmarkCount() {
    bookmarkCount.textContent = bookmarks.length;
  }

  function openModal(product) {
    currentProductIndex = products.findIndex(p => p.id === product.id);
    currentImageIndex = 0;
   modal.style.display = "flex";
modalName.textContent = product.name;
modalPrice.textContent = product.price;
modalDescription.textContent = product.description;
updateMediaDisplay(product);

// Подсказка свайпа в модалке только один раз
const swipeHint = document.getElementById("swipe-hint");
if (!localStorage.getItem("swipeHintShown")) {
  swipeHint.style.display = "block";
  localStorage.setItem("swipeHintShown", "true");
  setTimeout(() => {
    swipeHint.style.display = "none";
  }, 3000);
} else {
  swipeHint.style.display = "none";
}


showSwipeHintOnce(); 

    prevBtn.onclick = () => showMedia(product, "prev");
    nextBtn.onclick = () => showMedia(product, "next");
  }

  function updateMediaDisplay(product) {
  mediaDisplay.innerHTML = "";

  if (!product.images || product.images.length === 0) {
    mediaDisplay.textContent = "Нет изображений";
    return;
  }

  // Создаем картинку
  const img = document.createElement("img");
  img.src = product.images[currentImageIndex];
  img.classList.add("modal-slider-image");
  img.style.transition = "opacity 0.3s ease";
  mediaDisplay.appendChild(img);

  let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

img.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  isSwiping = false;
});

img.addEventListener("touchmove", (e) => {
  const touchMoveX = e.changedTouches[0].screenX;
  const touchMoveY = e.changedTouches[0].screenY;

  if (Math.abs(touchMoveX - touchStartX) > Math.abs(touchMoveY - touchStartY)) {
    isSwiping = true;
    e.preventDefault(); // отключить вертикальную прокрутку
  }
});

img.addEventListener("touchend", (e) => {
  if (!isSwiping) return;

  const touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) < 30) return;

  if (diff > 0) {
    // Вперёд
    currentImageIndex = (currentImageIndex + 1) % product.images.length;
  } else {
    // Назад
    currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
  }

  // Анимация смены изображения
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = product.images[currentImageIndex];
    img.style.opacity = 1;
  }, 200);
});

}




  function showMedia(product, direction) {
  if (!product.images || product.images.length === 0) return;

  if (direction === "prev") {
    currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
  } else if (direction === "next") {
    currentImageIndex = (currentImageIndex + 1) % product.images.length;
  }
  updateMediaDisplay(product);
}


  modalClose.onclick = () => modal.style.display = "none";
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  openBookmarksBtn.onclick = () => {
    bookmarksModal.style.display = "flex";
    renderBookmarks();
  };

  closeBookmarksBtn.onclick = () => bookmarksModal.style.display = "none";

  function renderBookmarks() {
    bookmarksItems.innerHTML = "";
    const bookmarkedProducts = products.filter(p => bookmarks.includes(p.id));

    if (bookmarkedProducts.length === 0) {
      bookmarksEmpty.style.display = "block";
    } else {
      bookmarksEmpty.style.display = "none";
      bookmarkedProducts.forEach(product => {
        const item = document.createElement("div");
        const name = document.createElement("span");
        name.textContent = product.name;

        const thumb = document.createElement("img");
        thumb.src = product.images[0];
        thumb.classList.add("bookmark-thumb");

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Удалить";
        removeBtn.onclick = () => {
          bookmarks = bookmarks.filter(id => id !== product.id);
          localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
          updateBookmarkCount();
          renderBookmarks();
          renderPage();
        };

        item.appendChild(thumb);
        item.appendChild(name);
        item.appendChild(removeBtn);
        bookmarksItems.appendChild(item);
      });
    }
  }
  

