const bookshelf = [];
const LOAD_EVENT = "BookshelfRender";
const STORAGE_KEY = "BOOKSHELF_APPS";

findBook = (bookId) => {
  for (const book of bookshelf) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
};

findBookIndex = (bookId) => {
  for (const index in bookshelf) {
    if (bookshelf[index].id === bookId) {
      return index;
    }
  }
  return -1;
};

checkStorage = () => {
  if (typeof Storage === "undefined") {
    swalErrorStorage();
    return false;
  }
  return true;
};

booksAPIs = (keyword) => {
  const keyAPI = "AIzaSyDnLkptwPUheDgwPk4s3UJQlcaGMvvrWOg";
  const booksAPIs_URL = "https://www.googleapis.com/books/v1/volumes?q=";
  const booksAPIs_URI = booksAPIs_URL + keyword + "&key=" + keyAPI;

  return (
    booksAPIs_URI +
    "&fields=items(id,volumeInfo(title,authors,publishedDate,imageLinks/thumbnail))"
  );
};

fetchBooks = () => {
  const keywordAdd = document.querySelector("#formInput_keywordAdd");
  const resBook_keyword = document.querySelector("#resBook_keyword");
  const itemsBook = document.querySelector(".resBook_items");

  resBook_keyword.innerHTML = "Hasil keyword dari";
  resBook_keyword.innerHTML += ` <strong>${keywordAdd.value}</strong>`;
  itemsBook.innerHTML = "";

  fetch(booksAPIs(keywordAdd.value))
    .then((response) => response.json())
    .then((data) => {
      data.items.forEach((book) => {
        const { id, volumeInfo } = book;
        const { title, authors, publishedDate } = volumeInfo;
        const year = publishedDate ? publishedDate.split("-")[0] : "-";
        const cover = volumeInfo.imageLinks
          ? volumeInfo.imageLinks.thumbnail
          : "https://via.placeholder.com/150";
        const item = `
          <div class="itemsBook">
            <img src="${cover}" alt="${title}" />
            <div class="itemsBook_details">
              <p class="hidden">${id}</p>
              <h5>${title}</h5>
              <p>${authors}</p>
              <p>${year}</p>
            </div>
            <button type="submit" class="btnAdd" id="itemsBook_button">Tambah buku</button>
          </div>
        `;

        itemsBook.innerHTML += item;
        addBook();
      });
    });
};

addBook = () => {
  const itemsBook_button = document.querySelectorAll("#itemsBook_button");

  itemsBook_button.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const bookData = {
        id: e.target.parentElement.querySelector("p").innerHTML,
        cover: e.target.parentElement.querySelector("img").src,
        title: e.target.parentElement.querySelector("h5").innerHTML,
        authors:
          e.target.parentElement.querySelector("p:nth-child(3)").innerHTML,
        year: parseInt(
          e.target.parentElement.querySelector("p:nth-child(4)").innerHTML
        ),
        isComplete: false,
      };

      if (bookshelf.length === 0) {
        swalSuccess();
        bookshelf.push(bookData);
      } else {
        let isExist = false;
        bookshelf.forEach((book) => {
          if (book.id === bookData.id) {
            swalInfoDuplicate();
            isExist = true;
          }
        });
        if (!isExist) {
          swalSuccess();
          bookshelf.push(bookData);
        }
      }

      document.dispatchEvent(new Event(LOAD_EVENT));
      shelfStorage();
    });
  });
};

makeBook = (bookData) => {
  const { id, cover, title, authors, year, isComplete } = bookData;
  const book = document.createElement("div");

  book.classList.add("itemsBook");
  book.innerHTML = `
    <img src="${cover}" alt="${title}" />
    <div class="itemsBook_details">
      <h5>${title}</h5>
      <p>${authors}</p>
      <p>${year}</p>
    </div>
  `;

  if (isComplete) {
    const btnStatus_undo = document.createElement("button");
    btnStatus_undo.classList.add("btnUndo");
    btnStatus_undo.innerHTML = "Tandai belum";
    btnStatus_undo.addEventListener("click", () => {
      undoBookComplete(id);
    });

    const btnStatus_delete = document.createElement("button");
    btnStatus_delete.classList.add("btnDelete");
    btnStatus_delete.innerHTML = "Hapus buku";
    btnStatus_delete.addEventListener("click", () => {
      removeBookComplete(id);
    });

    book.append(btnStatus_undo, btnStatus_delete);
  } else {
    const btnStatus_done = document.createElement("button");
    btnStatus_done.classList.add("btnDone");
    btnStatus_done.innerHTML = "Tandai selesai";
    btnStatus_done.addEventListener("click", () => {
      addBookComplete(id);
    });

    const btnStatus_delete = document.createElement("button");
    btnStatus_delete.classList.add("btnDelete");
    btnStatus_delete.innerHTML = "Hapus buku";
    btnStatus_delete.addEventListener("click", () => {
      removeBookComplete(id);
    });

    book.append(btnStatus_done, btnStatus_delete);
  }

  return book;
};

addBookComplete = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  swalConfirmMove(bookTarget, true);
};

undoBookComplete = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  swalConfirmMove(bookTarget, false);
};

removeBookComplete = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  swalConfirmDelete(bookTarget);
};

shelfStorage = () => {
  if (checkStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookshelf));
  }
};

loadShelfStorage = () => {
  const dataStorage = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(dataStorage);

  if (data !== null) {
    bookshelf.push(...data);
  }

  document.dispatchEvent(new Event(LOAD_EVENT));
};

swalErrorStorage = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Browser tidak support local storage",
  });
};

swalSuccess = () => {
  Swal.fire({
    icon: "success",
    title: "Buku berhasil ditambahkan",
    showConfirmButton: false,
    timer: 1500,
  });
};

swalInfoDuplicate = () => {
  Swal.fire({
    icon: "info",
    title: "Duplicate data...",
    text: "Buku sudah ada di Rak Buku!",
  });
};

swalConfirmMove = (bookTarget, boolean) => {
  Swal.fire({
    title: "Are you sure?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, pindahkan!",
  }).then((result) => {
    if (result.isConfirmed) {
      bookTarget.isComplete = boolean;
      Swal.fire("Dipindahkan!", "Buku telah dipindahkan.", "success");
      document.dispatchEvent(new Event(LOAD_EVENT));
      shelfStorage();
    }
  });
};

swalConfirmDelete = (bookTarget) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Anda tidak akan dapat mengembalikan ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapus!",
  }).then((result) => {
    if (result.isConfirmed) {
      bookshelf.splice(bookTarget, 1);
      Swal.fire("Dihapus!", "Buku telah dihapus.", "success");
      document.dispatchEvent(new Event(LOAD_EVENT));
      shelfStorage();
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const addBook_form = document.querySelector("#addBook_form");
  const shelfBook_form = document.querySelector("#shelfBook_form");

  addBook_form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetchBooks();
  });

  shelfBook_form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.dispatchEvent(new Event(LOAD_EVENT));
  });

  if (checkStorage()) {
    loadShelfStorage();
  }
});

document.addEventListener(LOAD_EVENT, () => {
  const uncompletedBookList = document.querySelector("#uncompletedBookList");
  const completedBookList = document.querySelector("#completedBookList");
  const keywordShelf = document.querySelector("#formInput_keywordShelf");
  const bookshelf_filtered = bookshelf.filter((book) => {
    if (book.title.toLowerCase().includes(keywordShelf.value.toLowerCase())) {
      return book;
    }
  });

  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";

  if (keywordShelf.value === "") {
    for (itemsBook of bookshelf) {
      const bookElement = makeBook(itemsBook);
      if (itemsBook.isComplete) {
        completedBookList.appendChild(bookElement);
      } else {
        uncompletedBookList.appendChild(bookElement);
      }
    }
  } else {
    for (itemsBook of bookshelf_filtered) {
      const bookElement = makeBook(itemsBook);
      if (itemsBook.isComplete) {
        completedBookList.appendChild(bookElement);
      } else {
        uncompletedBookList.appendChild(bookElement);
      }
    }
  }
});
