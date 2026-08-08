import { Module_50x50, Module_100x50, Hardware_Component } from './components.js';

const Workspace_Node = document.getElementById("Workspace_Area");
const Canvas_Node = document.getElementById("Wiring_Canvas");
const Cable_Configuration = {
    RJ45: { Color: "blue", Width: 2 },
    Fiber: { Color: "orange", Width: 2 },
    Power: { Color: "red", Width: 3 }
};

let Global_Component_Index = 0;
let Active_Connections = [];
let Global_Mode = "Drag";
let Wiring_State = { Is_Drawing: false, Last_Node: null };
let Drag_State = { Is_Dragging: false, Target: null, Offset_X: 0, Offset_Y: 0 };

document.querySelectorAll('input[name="Application_Mode"]').forEach(Radio_Input => {
    Radio_Input.addEventListener("change", (Event) => {
        Global_Mode = Event.target.value;
        if (Global_Mode === "Delete_Cable") {
            Canvas_Node.classList.add("Mode_Delete_Cable");
        } else {
            Canvas_Node.classList.remove("Mode_Delete_Cable");
        }
        Wiring_State.Is_Drawing = false;
        Wiring_State.Last_Node = null;
    });
});

function Get_Connection_Coordinates(Node_Id, Cable_Type, Element_Rectangle, Workspace_Rectangle) {
    let Coordinate_X = Element_Rectangle.left + (Element_Rectangle.width / 2) - Workspace_Rectangle.left + Workspace_Node.scrollLeft;
    let Coordinate_Y = Element_Rectangle.top + (Element_Rectangle.height / 2) - Workspace_Rectangle.top + Workspace_Node.scrollTop;

    if (Node_Id.startsWith("Module_")) {
        const Offset_Pixels = 8;
        if (Cable_Type === "Power") {
            Coordinate_X += Offset_Pixels;
            Coordinate_Y += Offset_Pixels;
        } else {
            Coordinate_X -= Offset_Pixels;
            Coordinate_Y -= Offset_Pixels;
        }
    }

    return { X: Coordinate_X, Y: Coordinate_Y };
}

function Validate_Signal_Ports(Node_Id) {
    if (!Node_Id.startsWith("Module_")) return true;
    let Active_Ports = 0;
    Active_Connections.forEach(Connection => {
        if ((Connection.Start === Node_Id || Connection.End === Node_Id) && (Connection.Type === "RJ45" || Connection.Type === "Fiber")) {
            Active_Ports++;
        }
    });
    return Active_Ports < 2;
}

function Render_Cables() {
    Canvas_Node.innerHTML = '<defs><marker id="Arrow_Head" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#fff" /></marker></defs>';
    
    Active_Connections.forEach(Connection => {
        const Node_A = document.getElementById(Connection.Start);
        const Node_B = document.getElementById(Connection.End);
        
        if (!Node_A || !Node_B) {
            return;
        }

        const Rectangle_A = Node_A.getBoundingClientRect();
        const Rectangle_B = Node_B.getBoundingClientRect();
        const Workspace_Rectangle = Workspace_Node.getBoundingClientRect();

        const Start_Coordinates = Get_Connection_Coordinates(Connection.Start, Connection.Type, Rectangle_A, Workspace_Rectangle);
        const End_Coordinates = Get_Connection_Coordinates(Connection.End, Connection.Type, Rectangle_B, Workspace_Rectangle);

        const Line_Svg = document.createElementNS("http://www.w3.org/2000/svg", "line");
        Line_Svg.setAttribute("x1", Start_Coordinates.X);
        Line_Svg.setAttribute("y1", Start_Coordinates.Y);
        Line_Svg.setAttribute("x2", End_Coordinates.X);
        Line_Svg.setAttribute("y2", End_Coordinates.Y);
        Line_Svg.setAttribute("stroke", Cable_Configuration[Connection.Type].Color);
        Line_Svg.setAttribute("stroke-width", Cable_Configuration[Connection.Type].Width);
        Line_Svg.setAttribute("class", "Svg_Cable");
        
        if (Connection.Type === "Fiber") {
            Line_Svg.setAttribute("marker-end", "url(#Arrow_Head)");
        }

        Line_Svg.addEventListener("click", () => {
            if (Global_Mode === "Delete_Cable") {
                Active_Connections = Active_Connections.filter(Connection_Item => Connection_Item !== Connection);
                Render_Cables();
            }
        });
        
        Canvas_Node.appendChild(Line_Svg);
    });

    const All_Modules = document.querySelectorAll(".Led_Module");
    All_Modules.forEach(Module_Node => {
        let Rj45_Count = 0;
        let Fiber_Count = 0;

        Active_Connections.forEach(Connection => {
            if (Connection.Start === Module_Node.id || Connection.End === Module_Node.id) {
                if (Connection.Type === "RJ45") Rj45_Count++;
                if (Connection.Type === "Fiber") Fiber_Count++;
            }
        });

        if (Rj45_Count === 1 && Fiber_Count === 0) {
            const Module_Rectangle = Module_Node.getBoundingClientRect();
            const Workspace_Rectangle = Workspace_Node.getBoundingClientRect();
            
            const Center_X = Module_Rectangle.left + (Module_Rectangle.width / 2) - Workspace_Rectangle.left + Workspace_Node.scrollLeft;
            const Center_Y = Module_Rectangle.top + (Module_Rectangle.height / 2) - Workspace_Rectangle.top + Workspace_Node.scrollTop;
            const Cross_Offset = 8;

            const Cross_Path_1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            Cross_Path_1.setAttribute("x1", Center_X - Cross_Offset);
            Cross_Path_1.setAttribute("y1", Center_Y - Cross_Offset);
            Cross_Path_1.setAttribute("x2", Center_X + Cross_Offset);
            Cross_Path_1.setAttribute("y2", Center_Y + Cross_Offset);
            Cross_Path_1.setAttribute("stroke", "red");
            Cross_Path_1.setAttribute("stroke-width", "3");
            
            const Cross_Path_2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            Cross_Path_2.setAttribute("x1", Center_X + Cross_Offset);
            Cross_Path_2.setAttribute("y1", Center_Y - Cross_Offset);
            Cross_Path_2.setAttribute("x2", Center_X - Cross_Offset);
            Cross_Path_2.setAttribute("y2", Center_Y + Cross_Offset);
            Cross_Path_2.setAttribute("stroke", "red");
            Cross_Path_2.setAttribute("stroke-width", "3");

            Canvas_Node.appendChild(Cross_Path_1);
            Canvas_Node.appendChild(Cross_Path_2);
        }
    });
}

function Bind_Node_Events(Element_Target) {
    Element_Target.addEventListener("mousedown", (Event) => {
        if (Global_Mode === "Delete_Component") {
            Event.stopPropagation();
            const Is_Container = Element_Target.classList.contains("Draggable_Component");
            const Target_Element = Is_Container ? Element_Target : Element_Target.closest(".Draggable_Component");
            
            if (Target_Element) {
                if (confirm("Execute hardware deletion? All mapped topologies to this node will be severed.")) {
                    Target_Element.remove();
                    Active_Connections = Active_Connections.filter(Connection_Item => document.getElementById(Connection_Item.Start) && document.getElementById(Connection_Item.End));
                    Render_Cables();
                }
            }
            return;
        }

        if (Global_Mode === "Cable" && Event.button === 0) {
            Event.stopPropagation();
            Wiring_State.Is_Drawing = true;
            Wiring_State.Last_Node = Element_Target.id;
        }
    });

    Element_Target.addEventListener("mouseenter", () => {
        if (!Wiring_State.Is_Drawing || Global_Mode !== "Cable") return;
        if (!Wiring_State.Last_Node || Wiring_State.Last_Node === Element_Target.id) return;

        const Node_Origin_Element = document.getElementById(Wiring_State.Last_Node);
        if (!Node_Origin_Element) {
            Wiring_State.Is_Drawing = false;
            Wiring_State.Last_Node = null;
            return;
        }

        const Selected_Cable = document.querySelector('input[name="Cable_Type"]:checked').value;
        const Node_Origin = Wiring_State.Last_Node;
        const Node_Destination = Element_Target.id;

        if (Selected_Cable === "RJ45" || Selected_Cable === "Fiber") {
            if (!Validate_Signal_Ports(Node_Origin) || !Validate_Signal_Ports(Node_Destination)) {
                Wiring_State.Last_Node = Element_Target.id;
                return;
            }
        }

        if (Selected_Cable === "Fiber") {
            const Is_Module_Origin = Node_Origin.startsWith("Module_");
            const Is_Module_Destination = Node_Destination.startsWith("Module_");
            const Is_Switch_Origin = Node_Origin.startsWith("Switch_");
            const Is_Switch_Destination = Node_Destination.startsWith("Switch_");
            const Is_Processor_Origin = Node_Origin.startsWith("Processor_");
            const Is_Processor_Destination = Node_Destination.startsWith("Processor_");

            const Valid_Module_Switch = (Is_Module_Origin && Is_Switch_Destination) || (Is_Switch_Origin && Is_Module_Destination);
            const Valid_Switch_Processor = (Is_Switch_Origin && Is_Processor_Destination) || (Is_Processor_Origin && Is_Switch_Destination);

            if (!Valid_Module_Switch && !Valid_Switch_Processor) {
                Wiring_State.Last_Node = Element_Target.id;
                return;
            }
        }

        Active_Connections.push({
            Start: Node_Origin,
            End: Node_Destination,
            Type: Selected_Cable
        });
        Wiring_State.Last_Node = Element_Target.id;
        Render_Cables();
    });
}

function Bind_Drag_Event(Element_Target) {
    Element_Target.addEventListener("mousedown", (Event) => {
        if (Global_Mode !== "Drag") return;
        Drag_State.Is_Dragging = true;
        Drag_State.Target = Element_Target;
        Drag_State.Offset_X = Event.clientX - Element_Target.getBoundingClientRect().left;
        Drag_State.Offset_Y = Event.clientY - Element_Target.getBoundingClientRect().top;
    });
}

document.addEventListener("mousemove", (Event) => {
    if (!Drag_State.Is_Dragging || !Drag_State.Target) return;
    const Workspace_Rectangle = Workspace_Node.getBoundingClientRect();
    const New_X = Event.clientX - Workspace_Rectangle.left - Drag_State.Offset_X + Workspace_Node.scrollLeft;
    const New_Y = Event.clientY - Workspace_Rectangle.top - Drag_State.Offset_Y + Workspace_Node.scrollTop;
    
    Drag_State.Target.style.left = `${New_X}px`;
    Drag_State.Target.style.top = `${New_Y}px`;
    Render_Cables();
});

document.addEventListener("mouseup", () => {
    Drag_State.Is_Dragging = false;
    Drag_State.Target = null;
    Wiring_State.Is_Drawing = false;
    Wiring_State.Last_Node = null;
});

Workspace_Node.addEventListener("mouseleave", () => {
    Drag_State.Is_Dragging = false;
    Drag_State.Target = null;
    Wiring_State.Is_Drawing = false;
    Wiring_State.Last_Node = null;
});

document.getElementById("Button_Generate_Screen").addEventListener("click", () => {
    const Input_Width = parseFloat(document.getElementById("Input_Width").value);
    const Input_Height = parseFloat(document.getElementById("Input_Height").value);
    const Module_Type = document.getElementById("Select_Module").value;

    const Module_Width_Meters = Module_Type === "100x50" ? 1.0 : 0.5;
    const Module_Height_Meters = 0.5;

    const Columns = Math.floor(Input_Width / Module_Width_Meters);
    const Rows = Math.floor(Input_Height / Module_Height_Meters);

    if (Columns <= 0 || Rows <= 0) {
        console.log("Error: Invalid grid dimensions computed.");
        return;
    }

    const Screen_Container = document.createElement("div");
    Screen_Container.className = "Draggable_Component Led_Screen_Grid";
    Screen_Container.style.gridTemplateColumns = `repeat(${Columns}, 1fr)`;
    Screen_Container.style.left = "50px";
    Screen_Container.style.top = "50px";

    Screen_Container.addEventListener("mouseleave", () => {
        if (Global_Mode === "Cable" && Wiring_State.Is_Drawing) {
            Wiring_State.Is_Drawing = false;
            Wiring_State.Last_Node = null;
        }
    });

    for (let Index = 0; Index < (Columns * Rows); Index++) {
        Global_Component_Index++;
        const Module_Id = `Module_${Global_Component_Index}`;
        const Module_Instance = Module_Type === "100x50" ? new Module_100x50(Module_Id) : new Module_50x50(Module_Id);
        Bind_Node_Events(Module_Instance.Element);
        Screen_Container.appendChild(Module_Instance.Element);
    }

    Bind_Drag_Event(Screen_Container);
    Bind_Node_Events(Screen_Container);
    Workspace_Node.appendChild(Screen_Container);
});

document.getElementById("Button_Add_Switch").addEventListener("click", () => {
    Global_Component_Index++;
    const Switch_Instance = new Hardware_Component("Switch", `Switch_${Global_Component_Index}`);
    Bind_Drag_Event(Switch_Instance.Element);
    Bind_Node_Events(Switch_Instance.Element);
    Workspace_Node.appendChild(Switch_Instance.Element);
});

document.getElementById("Button_Add_Processor").addEventListener("click", () => {
    Global_Component_Index++;
    const Processor_Instance = new Hardware_Component("Procesador", `Processor_${Global_Component_Index}`);
    Bind_Drag_Event(Processor_Instance.Element);
    Bind_Node_Events(Processor_Instance.Element);
    Workspace_Node.appendChild(Processor_Instance.Element);
});

document.getElementById("Button_Export_Pdf").addEventListener("click", () => {
    const Element_To_Export = document.getElementById("Workspace_Area");
    const Canvas_Element = document.getElementById("Wiring_Canvas");

    const Original_Overflow = Element_To_Export.style.overflow;
    const Original_Position = Element_To_Export.style.position;
    const Original_Width = Canvas_Element.style.width;
    const Original_Height = Canvas_Element.style.height;

    Element_To_Export.style.overflow = "visible";
    Element_To_Export.style.position = "static";
    
    Canvas_Element.style.width = `${Element_To_Export.scrollWidth}px`;
    Canvas_Element.style.height = `${Element_To_Export.scrollHeight}px`;

    const Export_Options = {
        margin: 10,
        filename: 'Led_Screen_Diagram.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            width: Element_To_Export.scrollWidth,
            height: Element_To_Export.scrollHeight,
            windowWidth: document.documentElement.scrollWidth,
            windowHeight: document.documentElement.scrollHeight
        },
        jsPDF: { unit: 'mm', format: 'a3', orientation: 'landscape' }
    };
    
    html2pdf().set(Export_Options).from(Element_To_Export).save().then(() => {
        Element_To_Export.style.overflow = Original_Overflow;
        Element_To_Export.style.position = Original_Position;
        Canvas_Element.style.width = Original_Width;
        Canvas_Element.style.height = Original_Height;
    });
});