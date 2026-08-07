export class Module_50x50 {
    constructor(Id) {
        this.Element = document.createElement("div");
        this.Element.className = "Led_Module";
        this.Element.style.width = "50px";
        this.Element.style.height = "50px";
        this.Element.id = Id;
        this.Element.innerText = "50x50";
    }
}

export class Module_100x50 {
    constructor(Id) {
        this.Element = document.createElement("div");
        this.Element.className = "Led_Module";
        this.Element.style.width = "100px";
        this.Element.style.height = "50px";
        this.Element.id = Id;
        this.Element.innerText = "100x50";
    }
}

export class Hardware_Component {
    constructor(Type, Id) {
        this.Element = document.createElement("div");
        this.Element.className = "Draggable_Component Hardware_Node";
        this.Element.id = Id;
        this.Element.innerText = Type;
        this.Element.style.left = "10px";
        this.Element.style.top = "10px";
    }
}