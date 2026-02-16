let filter=document.getElementsByClassName("filter");
  let category="";
  for(let f of filter){
    f.addEventListener("click",()=>{
      category=f.querySelector("div").id;
      getCategory(category);
    })
  }
  function getCategory(category){
   
     window.location.href = `/listings/category/${category}`;
  }