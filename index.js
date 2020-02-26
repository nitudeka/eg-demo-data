const fs = require("fs");
const FormData = require("form-data");
let fetch = require("node-fetch");

const apiUrl = "https://egoshop.herokuapp.com";

const addLatLong = (lat, long, range = 1000) => {
  const earth = 6378.137, //radius of the earth in kilometer
    pi = Math.PI,
    cos = Math.cos,
    m = 1 / (((2 * pi) / 360) * earth) / 1000; //1 meter in degree

  const new_latitude = lat + range * m;

  const new_longitude = long + (range * m) / cos(lat * (pi / 180));

  return { lat: new_latitude, long: new_longitude };
};

const sendData = async data => {
  if (!data) return;

  const formData = new FormData();
  formData.append("file", fs.createReadStream("./images/" + data.img));

  try {
    const shopRes = await fetch(apiUrl + "/admin/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        location: data.location
      })
    });
    const parsedShopData = await shopRes.json();
    const shopId = parsedShopData.data.shopId;

    const fileRes = await fetch(apiUrl + "/file", {
      method: "POST",
      body: formData
    });
    const parsedFileData = await fileRes.json();
    const imgUrl = parsedFileData.data.url;

    await fetch(apiUrl + "/admin/shop", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imgUrl,
        shopId: shopId
      })
    });

    return "success";
  } catch (err) {
    console.log(err);
    console.log("error happened");
  }
};

const insertDemoData = (lat, long, noOfDocs, range) => {
  if (!lat && !long && !noOfDocs) return;

  const demoData = [
    { name: "DLF", img: "WhatsApp Image 2020-02-18 at 3.26.19 PM (1).jpeg" },
    { name: "Big Bazar", img: "WhatsApp Image 2020-02-18 at 3.26.19 PM.jpeg" },
    {
      name: "Infiniti",
      img: "WhatsApp Image 2020-02-18 at 3.26.20 PM (1).jpeg"
    },
    { name: "IELTS", img: "WhatsApp Image 2020-02-18 at 3.26.20 PM.jpeg" },
    { name: "Max", img: "WhatsApp Image 2020-02-18 at 3.26.21 PM (1).jpeg" },
    { name: "TMF", img: "WhatsApp Image 2020-02-18 at 3.26.21 PM.jpeg" },
    { name: "Pantaloons", img: "WhatsApp Image 2020-02-18 at 3.26.22 PM.jpeg" },
    { name: "Zara", img: "WhatsApp Image 2020-02-18 at 3.26.23 PM (1).jpeg" },
    { name: "Market City", img: "WhatsApp Image 2020-02-18 at 3.26.23 PM.jpeg" }
  ];

  const selectedDocs = [];
  for (let i = 0; i < noOfDocs; i++) {
    const rand = Math.floor(Math.random() * (demoData.length - 1));
    selectedDocs.push({
      ...demoData[rand],
      location: addLatLong(lat, long, Math.floor(Math.random() * range))
    });
  }

  let length = selectedDocs.length;

  const recursive = async length => {
    if (length < 0) return;
    await sendData(selectedDocs[length]);
    recursive(length - 1);
  };
  recursive(length - 1);
  console.log("inserted demo data successfully");
};

insertDemoData(26.1663901, 91.7828496, 50, 1200);
