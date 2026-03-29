const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, "../frontend")));


const ordersFile = path.join(__dirname, "orders.json");



function readOrders() {
  try {
    if (fs.existsSync(ordersFile)) {
      const data = fs.readFileSync(ordersFile, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading orders:", error);
  }
  
  return [];
}


function writeOrders(orders) {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    console.log("Orders saved to:", ordersFile);
    return true;
  } catch (error) {
    console.error("Error writing orders:", error);
    return false;
  }
}



app.post("/order", (req, res) => {
  const { fileName, pages, type, copies, price } = req.body;
  
  
  if (!fileName || fileName.trim() === "") {
    return res.status(400).json({ message: "File name required" });
  }
  
  if (!pages || pages < 1) {
    return res.status(400).json({ message: "Invalid page count" });
  }
  
  if (type !== "bw" && type !== "color") {
    return res.status(400).json({ message: "Invalid print type" });
  }
  
  const copyCount = parseInt(copies);
  if (copyCount < 1 || copyCount > 100) {
    return res.status(400).json({ message: "Copies must be between 1-100" });
  }
  
  
  const order = {
    id: Date.now(),
    fileName: fileName,
    pages: pages,
    type: type,
    copies: copyCount,
    price: price,
    timestamp: new Date().toISOString()
  };
  
  


  const orders = readOrders();
  
  orders.push(order);
  
  
  if (writeOrders(orders)) {
    console.log("Order saved:", order.fileName);
    res.json({ message: "Order saved successfully!" });
  } else {
    res.status(500).json({ message: "Failed to save order" });
  }
});




app.get("/orders", (req, res) => {
  const orders = readOrders();
  console.log("Orders fetched:", orders.length);
  res.json(orders);
});




const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Orders will be saved to: ${ordersFile}`);
});