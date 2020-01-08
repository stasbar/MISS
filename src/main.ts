import jquery from "jquery";
window.$ = jquery;
import "popper.js";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.css"; // Import precompiled Bootstrap css
import "@fortawesome/fontawesome-free/css/all.css";
import "vis-timeline/dist/vis-timeline-graph2d.css";

import { dump } from "./data";

$("#dump").click(() => dump());

/* import "./index"; */
import "./probdup";
/* import "./randdup"; */
