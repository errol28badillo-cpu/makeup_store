const STORAGE_KEY = "anythingmart-listings-v1";

const seedData = [
  {
    id: crypto.randomUUID(),
    title: "Gaming Laptop",
    price: 750,
    category: "Electronics",
    description: "16GB RAM, RTX graphics, great condition.",
    sold: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Road Bike",
    price: 320,
    category: "Sports",
    description: "Lightweight frame, recently serviced.",
    sold: false,
  },
];

const form = document.getElementById("listingForm");
const listingsRoot = document.getElementById("listings");
const template = document.getElementById("listingTemplate");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("filterCategory");

const getListings = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedData;
  try {
    return JSON.parse(saved);
  } catch {
    return seedData;
  }
};

let listings = getListings();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function render() {
  const term = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = listings.filter((item) => {
    const matchesSearch = !term || item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term);
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  listingsRoot.innerHTML = "";
  if (!filtered.length) {
    listingsRoot.innerHTML = '<p class="empty">No listings found.</p>';
    return;
  }

  for (const item of filtered) {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".listing-title").textContent = item.title;
    node.querySelector(".listing-meta").textContent = `${item.category}${item.sold ? " • SOLD" : ""}`;
    node.querySelector(".listing-description").textContent = item.description;
    node.querySelector(".listing-price").textContent = money(item.price);

    const buyBtn = node.querySelector(".buy-btn");
    buyBtn.disabled = item.sold;
    buyBtn.textContent = item.sold ? "Sold" : "Buy";
    buyBtn.addEventListener("click", () => {
      listings = listings.map((listing) =>
        listing.id === item.id ? { ...listing, sold: true } : listing
      );
      save();
      render();
    });

    node.querySelector(".remove-btn").addEventListener("click", () => {
      listings = listings.filter((listing) => listing.id !== item.id);
      save();
      render();
    });

    listingsRoot.append(node);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const price = Number(data.get("price"));
  const category = String(data.get("category") || "").trim();
  const description = String(data.get("description") || "").trim();

  if (!title || Number.isNaN(price) || price < 0 || !category) return;

  listings.unshift({
    id: crypto.randomUUID(),
    title,
    price,
    category,
    description,
    sold: false,
  });

  form.reset();
  save();
  render();
});

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);

save();
render();
