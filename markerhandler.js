AFRAME.registerComponent("markerhandler", {
  init: async function() {
    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(toys, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  handleMarkerFound: function(toys, markerId) {
    var toy=toys.filter(toy=>toy.id==markerId)[0]
    if (toy.is_out_of_stock) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "This toy is not available today. Sorry for the inconvenience.",
        timer: 2500,
        buttons: false
      })};
    var buttonDiv = document.getElementById("button-div");
   // Changing button div visibility
    buttonDiv.style.display = "flex";

    var orderButtton = document.getElementById("order-button");
    var orderSummaryButtton = document.getElementById("order-summary-button");

    // Handling Click Events for orderButton and orderSummaryButton

   
    var toy = toys.filter(toy => toy.id === markerId)[0];

    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("position", toy.model_geometry.position);
    model.setAttribute("rotation", toy.model_geometry.rotation);
    model.setAttribute("scale", toy.model_geometry.scale);
  },
  getToys: async function() {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {

    var buttonDiv = document.getElementById("button-div");
        // Changing button div visibility
    buttonDiv.style.display = "none";
  },
  handleOrder: function(uid,toy){
    firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get()
    .the(doc => {
      var details = doc.data()
      if(details["current_orders"][toy.id]){
        details["current_orders"][toy.id]["quantity"] +=1
        var currentQuantity=details["current_orders"][toy.id]["quantity"]
        details["current_orders"][toy.id]["subtotal"]=currentQuantity*toy.price;

      }else{
        details["current_orders"][toy.id]={
          item:toy.toy_name,
          price: toy.price,
          quantity:1,
          subtotal:toy.price*1
        }
      }
      details.total_bill+=toy.price
      firebase
      .firestore()
      .collection("users")
      .doc(doc.id)
      .update(details)
    })
  },
  getOrderSummary: async function(uid){
    return await firebase
    .firestore()
    .collection("users")
    .doc(uid)
    .get()
    .then(doc => doc.data())
  },
  handleOrderSummary: async function () {
    var modalDiv=document.getElementById("modal-div")
    modalDiv.style.display="flex"
    uid=uid.toUpperCase();
    var orderSUmmary = await this.getOrderSummary(uid)
    var tableBodyTag=document.getElementById("bill-table-body")
    tableBodyTag.innerHTML=""
    var currentOrders=Object.keys(orderSummary.current_orders);
    currentOrders.map(i =>{
      var tr=document.createElement("tr")
      var item=document.createElement("td")
      var price=document.createElement("td")
      var quantity=document.createElement("td")
      var subtotal=document.createElement("td")
      item.innerHTML=orderSummary.current_orders[i].price
      price.innerHTML = '$'+orderSummary.current_orders[i].quantity
      price.setAttribute("class","text-center")
      quantity.innerHTML = orderSummary.current_orders[i].quantity
      quantity.setAttribute("class","text-center")
      subtotal.innerHTML="$"+orderSummary.current_orders[i].subtotal
      subtotal.setAttribute("class","text-center")
      tr.appendChild(item)
      tr.appendChild(price)
      tr.appendChild(quantity)
      tr.appendChild(subtotal)
      tableBodyTag.appendChild(tr)
    })
  },
  handleRating:function(toy){
    document.getElementById("rating-modal-div").style.display="flex"
    document.getElementById("rating-input").value="0"
    var saveRatingButton=document.getElementById("save-rating-button")
    saveRatingButton.addEventListener("click",()=>{
      document.getElementById("rating-modal-div").style.display="none"
      var rating=document.getElementById("rating-input").value
      firebase
      .firestore()
      .collection("toys")
      .doc(toy.id)
      .update({
        rating:rating
      })
      .then(()=>
      swal({
        icon:"success",
        title:"Thanks For Rating!",
        text:"We Hope You Like Your Brand New Toy!",
        timer:2500,
        buttons:False
      }))
    })
  }

  
});
