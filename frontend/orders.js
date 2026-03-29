const table = document.getElementById("ordersTable");

fetch("http://localhost:3000/orders")
  .then(res => res.json())

  .then(data => {

    if (data.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem;">
            No orders found

          </td>
          
        </tr>
      `;
    } else {
      data.forEach(order => {
        const row = document.createElement("tr");
        
        const typeDisplay = order.type === "bw" ? "Black & White" : "Color";
        
        row.innerHTML = `
          <td>${order.fileName}</td>
          <td>${order.pages}</td>
          <td>${typeDisplay}</td>
          <td>${order.copies}</td>
          <td>₹${order.price}</td>
        `;
        
        table.appendChild(row);
      });
    }


  })
  .catch(error => {
    table.innerHTML = `
      <tr>

        <td colspan="5" style="text-align: center; padding: 2rem; color: red;">
          Failed to load orders. Make sure server is running.

        </td>
      </tr>
    `;
  });