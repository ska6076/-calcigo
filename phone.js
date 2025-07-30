function seterror(id,error){
    element=document.getElementById(id);
    element.getElementsByClassName('formerror')[0].innerHTML=error;
}

function validateForm(){
    var returnval=true;
    var name=document.forms['myform']['amount'].value;
    if(name.length<5){
        seterror("name", "Lenght of name is too short");
        returnval=false
    }

    if(name.length==0){
        seterror("name", "Lenght of name cannot be Zero");
        returnval=false
    }



    return returnval;
}