const titleElement = document.getElementById("category-title");
const params = new URLSearchParams(window.location.search);
const newCategory = params.get("category"); // tshirt, hoodie, и т.д.

let isSearching = false;
let searchTerm = "";

function generateDots(current, total) {
  return Array.from({ length: total }, (_, i) => (i === current ? '●' : '○')).join(' ');
}

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

function isValidProduct(p) {
  return p && typeof p.id === "string" &&
         typeof p.name === "string" &&
         Array.isArray(p.images) &&
         typeof p.price === "string"; // или number
}

let weatherFilter = "all"; // по умолчанию показывать все
let largeFilter = false;

const productGrid = document.getElementById("product-grid");
  const pagination = document.getElementById("pagination");
  const modal = document.getElementById("modal");
  const modalName = document.getElementById("modal-name");
  const modalPrice = document.getElementById("modal-price");
  const modalMaterial = document.getElementById("modal-material");
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

function getProductsPerPage() {
  const width = window.innerWidth;

  if (width <= 480) return 12;
  if (width <= 1024) return 16;
  return 24;
}

let productsPerPage = getProductsPerPage();

window.addEventListener("resize", () => {
  const newCount = getProductsPerPage();
  if (newCount !== productsPerPage) {
    productsPerPage = newCount;
    currentPage = 1;
    renderPage();
  }
});

let totalPages = 0;
let currentProductIndex = 0;

  let currentImageIndex = 0;
  function isValidBookmark(obj) {
  return obj && typeof obj === "object" && typeof obj.id === "string";
}

let rawBookmarks;
try {
  rawBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
} catch (e) {
  console.warn("Неверный формат в localStorage.bookmarks, сбрасываю", e);
  rawBookmarks = [];
}

let bookmarks = Array.isArray(rawBookmarks)
  ? rawBookmarks.filter(isValidBookmark)
  : [];

localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  updateBookmarkCount();
// Приводим старый формат (строки) к объектам
if (bookmarks.length && typeof bookmarks[0] === "string") {
  bookmarks = bookmarks.map(id => ({ id }));
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
}

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
  arr
    .filter(isValidProduct)
    .map(p => ({ ...p, category: files[i].category }))
);


      // Сортируем по статусу
      products.sort((a, b) => {
        const order = { new: 0, old: 1, out: 2 };
        return order[a.status] - order[b.status];
      });

      if (newCategory && categoryTitles[newCategory]) {
  currentCategory = newCategory;
} else {
  currentCategory = 'tshirt'; // или любую другую дефолтную категорию
}

// Обработка закладок из URL
const bookmarkIdsFromURL = decodeBookmarksFromURL();

if (bookmarkIdsFromURL.length > 0) {
  const bookmarksFromURL = bookmarkIdsFromURL.map(id => {
    const product = products.find(p => p.id === id);
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      image: product.images?.[0],
      price: product.price
    };
  }).filter(Boolean);

  if (bookmarksFromURL.length > 0) {
    bookmarks = bookmarksFromURL;
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    updateBookmarkCount();
    // Здесь НЕ нужно вызывать setCategory — просто отрисуем закладки, если хочешь
    renderPage(); 
    return;
  }
}

// Если нет bookmarks, то показать каталог категории
setCategory(currentCategory);


    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
    }
  }

  loadProducts();

const weatherFilterButtons = document.querySelectorAll("#weather-filter button");

weatherFilterButtons.forEach(button => {
  button.addEventListener("click", () => {
    weatherFilter = button.dataset.weather;
    currentPage = 1;
    renderPage();

    // Подсветка активной кнопки
    weatherFilterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");
  });
});


 function setCategory(category) {
  currentCategory = category;
  filteredProducts = products
    .filter(p => p.category === category)
    .sort((a, b) => {
      const order = { new: 0, old: 1, out: 2 };
      return (order[a.status] ?? 1) - (order[b.status] ?? 1);
    });

  totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  currentPage = 1;

  if (categoryTitles[category]) {
    titleElement.textContent = categoryTitles[category];
  } else {
    titleElement.textContent = "Категория не найдена";
  }
  document.getElementById("search-input").value = "";
  isSearching = false;
  searchTerm = "";
  
  renderPage();
}

document.getElementById("search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  isSearching = !!searchTerm;
  currentPage = 1;
  renderPage();
});

const toggleLargeBtn = document.getElementById("toggle-large");
toggleLargeBtn.addEventListener("click", () => {
  largeFilter = !largeFilter;
  toggleLargeBtn.classList.toggle("active", largeFilter);
  currentPage = 1;
  renderPage();
});





function showSwipeHintOnce() {
  if (localStorage.getItem('swipeHintShown')) return;

  const hint = document.getElementById('swipe-hint');
  if (!hint) return;

  hint.style.display = 'block';
  hint.style.opacity = '1';
  hint.style.transition = 'opacity 0.5s ease';

  localStorage.setItem('swipeHintShown', 'true');

  setTimeout(() => {
    hint.style.opacity = '0';
    setTimeout(() => {
      hint.style.display = 'none';
      hint.style.opacity = '1'; // сброс
    }, 500);
  }, 3000);
}
function showSwipeHintModalOnce() {
  if (localStorage.getItem('swipeModalHintShown')) return;

  const hint = document.getElementById('swipe-hint-modal');
  if (!hint) return;

  hint.style.display = 'block';
  hint.style.opacity = '1';
  hint.style.transition = 'opacity 0.5s ease';

  localStorage.setItem('swipeModalHintShown', 'true');

  setTimeout(() => {
    hint.style.opacity = '0';
    setTimeout(() => {
      hint.style.display = 'none';
      hint.style.opacity = '1';
    }, 500);
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
    // Фильтрация по погоде
    let productsToRender;

    if (isSearching) {
      productsToRender = products.filter(p =>
        (p.name.toLowerCase().includes(searchTerm) ||
         p.name.replace(/^модель\s*/i, '').toLowerCase().includes(searchTerm)) &&
        (!largeFilter || p.tags?.includes("large"))
      );
    } else {
      productsToRender = filteredProducts.filter(p =>
        (weatherFilter === "all" || p.weather === weatherFilter) &&
        (!largeFilter || p.tags?.includes("large"))
      );
    }
     
// Пагинация на основе фильтрованных по погоде товаров
const start = (currentPage - 1) * productsPerPage;
const end = start + productsPerPage;
const visibleProducts = productsToRender.slice(start, end);
totalPages = Math.ceil(productsToRender.length / productsPerPage);

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
  setTimeout(() => {
  swipeHint.remove();
}, 3000);
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

if (product.images.length > 1) {
  const imageCounter = document.createElement("div");
  imageCounter.classList.add("image-counter", "image-counter-small");
  imageCounter.textContent = generateDots(currentImageIndex, product.images.length);
  sliderContainer.appendChild(imageCounter);

  // Обновление при листании
  leftArrow.onclick = (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
    animateSliderImageChange(sliderImage, product.images[currentImageIndex]);
    imageCounter.textContent = generateDots(currentImageIndex, product.images.length);

  };

  rightArrow.onclick = (e) => {
    e.stopPropagation();
    currentImageIndex = (currentImageIndex + 1) % product.images.length;
    animateSliderImageChange(sliderImage, product.images[currentImageIndex]);
    imageCounter.textContent = generateDots(currentImageIndex, product.images.length);

  };

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
    imageCounter.textContent = generateDots(currentImageIndex, product.images.length);

  });
}

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




// Добавляем в карточку
sliderContainer.appendChild(leftArrow);
sliderContainer.appendChild(sliderImage);
sliderContainer.appendChild(rightArrow);
productCard.appendChild(sliderContainer);
    const weatherIcon = document.createElement("div");
weatherIcon.classList.add("weather-icon");

switch(product.weather) {
  case "winter":
    weatherIcon.textContent = "❄️"; // снежинка
    break;
  case "summer":
    weatherIcon.textContent = "☀️"; // солнышко
    break;
  case "demiseason":
    weatherIcon.textContent = "🍂"; // листочек для демисезона
    break;
  default:
    weatherIcon.textContent = "";
}

sliderContainer.appendChild(weatherIcon);


      const productName = document.createElement("div");
      productName.classList.add("product-name");
      productName.textContent = product.name;



      const productPrice = document.createElement("div");
      productPrice.classList.add("product-price");
      productPrice.textContent = product.price;


const productExtraInfo = document.createElement("div");
productExtraInfo.classList.add("product-material");
productExtraInfo.textContent = product.material || "Материал не указан"; // <--- новая строка


     const bookmarkBtn = document.createElement("button");

const isBookmarked = bookmarks.some(b => b.id === product.id);


// Устанавливаем текст и стиль
bookmarkBtn.classList.add("bookmark-btn", isBookmarked ? "remove" : "add");
bookmarkBtn.textContent = isBookmarked ? "Удалить из закладок" : "Добавить в закладки";

bookmarkBtn.onclick = (e) => {
  e.stopPropagation(); // не открывать модалку товара при клике на кнопку
const isCurrentlyBookmarked = bookmarks.some(b => b.id === product.id);


  if (isCurrentlyBookmarked) {
    // Удаляем из закладок
    bookmarks = bookmarks.filter(b => {
      if (typeof b === 'string') return b !== product.id;
      return b.id !== product.id;
    });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    updateBookmarkCount();
    renderPage(); // Обновляем интерфейс
  } else {
    addToBookmarks(product);
renderPage();

  }

}; 

    
      productCard.appendChild(productName);

      productCard.appendChild(productPrice);
      productCard.appendChild(productExtraInfo);
      productCard.appendChild(bookmarkBtn);
      

      productCard.onclick = () => {
        openModal(product);
      };

      productGrid.appendChild(productCard);
    });

    renderPagination();
  } 

  function renderPagination() {
    const ids = ["pagination", "pagination-bottom"];
  
    ids.forEach(paginationId => {
      const container = document.getElementById(paginationId);
      if (!container) return;
  
      container.innerHTML = "";
  
      const paginationContainer = document.createElement("div");
      paginationContainer.style.display = "flex";
      paginationContainer.style.alignItems = "center";
      paginationContainer.style.justifyContent = "center";
  
      const firstButton = document.createElement("button");
      firstButton.textContent = "⏮";
      firstButton.disabled = currentPage === 1;
      firstButton.onclick = () => {
        currentPage = 1;
        renderPage();
      };
  
      const prevButton = document.createElement("button");
      prevButton.textContent = "← Назад";
      prevButton.disabled = currentPage === 1;
      prevButton.onclick = () => {
        currentPage--;
        renderPage();
      };
  
      const pageInfo = document.createElement("div");
      pageInfo.textContent = `${currentPage} из ${totalPages}`;
      pageInfo.style.margin = "0 10px";
  
      const nextButton = document.createElement("button");
      nextButton.textContent = "Вперёд →";
      nextButton.disabled = currentPage === totalPages;
      nextButton.onclick = () => {
        currentPage++;
        renderPage();
      };
  
      const lastButton = document.createElement("button");
      lastButton.textContent = "⏭";
      lastButton.disabled = currentPage === totalPages;
      lastButton.onclick = () => {
        currentPage = totalPages;
        renderPage();
      };
  
      paginationContainer.appendChild(firstButton);
      paginationContainer.appendChild(prevButton);
      paginationContainer.appendChild(pageInfo);
      paginationContainer.appendChild(nextButton);
      paginationContainer.appendChild(lastButton);
  
      container.appendChild(paginationContainer);
    });
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

if (!localStorage.getItem('swipeHintShown')) {
  showSwipeHintOnce();
}

if (!localStorage.getItem('swipeModalHintShown')) {
  showSwipeHintModalOnce();
}





    prevBtn.onclick = () => {
  if (currentProductIndex === -1) return; // если ничего не открыто
  const product = products[currentProductIndex];
  showMedia(product, "prev");
};

nextBtn.onclick = () => {
  if (currentProductIndex === -1) return;
  const product = products[currentProductIndex];
  showMedia(product, "next");
};

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
    const counter = document.querySelector(".modal-image-counter");
  if (counter) {
    counter.textContent = generateDots(currentImageIndex, product.images.length);
  }
  }, 200);
});
const existingCounter = document.querySelector(".modal-image-counter");
if (existingCounter) existingCounter.remove();

if (product.images.length > 1) {
  const counter = document.createElement("div");
  counter.classList.add("modal-image-counter");
  counter.textContent = generateDots(currentImageIndex, product.images.length);
  img.style.position = 'relative';
counter.style.position = 'absolute';
img.parentElement.style.position = 'relative'; 
img.parentElement.appendChild(counter);

}


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

  if (bookmarks.length === 0) {
    bookmarksEmpty.style.display = "block";
    return;
  }

  bookmarksEmpty.style.display = "none";

  bookmarks.forEach(bookmark => {
    const product = products.find(p => p.id === bookmark.id);
    if (!product) return;

    const item = document.createElement("div");
    item.classList.add("bookmark-item");

    const thumb = document.createElement("img");
    thumb.src = product.images[0];
    thumb.classList.add("bookmark-thumb");

    const name = document.createElement("span");
    name.textContent = product.name;



    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Удалить";
    removeBtn.onclick = () => {
      bookmarks = bookmarks.filter(b => b.id !== bookmark.id);
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


function addToBookmarks(product) {
  // Удаляем, если уже есть
  bookmarks = bookmarks.filter(b => {
    if (typeof b === 'string') return b !== product.id;
    return b.id !== product.id;
  });

  const newBookmark = {
    id: product.id,
    name: product.name,
    image: product.images?.[0],
    price: product.price

  };

  bookmarks.push(newBookmark);
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  updateBookmarkCount();
}
function encodeBookmarks(bookmarks) {
  // Пример: берем только id
  const ids = bookmarks.map(b => b.id);
  const jsonStr = JSON.stringify(ids);
  // base64 encode
  return btoa(jsonStr);
}
function createBookmarksLink(bookmarks) {
  const base64 = encodeBookmarks(bookmarks);
  // Предположим, что текущий url без параметров — window.location.origin + window.location.pathname
  return `${window.location.origin}${window.location.pathname}?bookmarks=${encodeURIComponent(base64)}`;
}
function decodeBookmarksFromURL() {
  const params = new URLSearchParams(window.location.search);
  const base64 = params.get('bookmarks');
  if (!base64) return [];

  try {
    const jsonStr = atob(base64);
    const ids = JSON.parse(jsonStr);
    return Array.isArray(ids) && ids.every(id => typeof id === "string") ? ids : [];
  } catch (e) {
    console.warn("Ошибка декодирования закладок из URL", e);
    return [];
  }
}



const copyLinkBtn = document.getElementById("copy-bookmarks-link");
const bookmarksLinkOutput = document.getElementById("bookmarks-link-output");

copyLinkBtn.addEventListener("click", async () => {
 console.log("bookmarks:", bookmarks); // ← добавь эту строку
  console.log("Ссылка для закладок:", createBookmarksLink(bookmarks)); // ← и эту

 
  const link = createBookmarksLink(bookmarks); 
  bookmarksLinkOutput.value = link;

  try {
    await navigator.clipboard.writeText(link);
    alert("Ссылка с закладками скопирована!");
  } catch (err) {
    // Fallback: старый метод на случай неподдержки
    try {
      bookmarksLinkOutput.select();
      document.execCommand('copy');
      alert("Ссылка скопирована устаревшим методом.");
    } catch {
      alert("Не удалось скопировать ссылку. Скопируйте вручную.");
    }
  }
});
const clearBookmarksBtn = document.getElementById('clear-bookmarks-container');

clearBookmarksBtn.addEventListener('click', () => {
  if (confirm('Вы действительно хотите удалить все закладки?')) {
    bookmarks = []; // очищаем массив
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks)); // сохраняем пустой массив в localStorage
    updateBookmarkCount(); // обновляем счетчик
    renderBookmarks(); // обновляем модалку с закладками
    renderPage(); // обновляем страницу с товарами
  }
});


