import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-sidebar-nav",
  templateUrl: "./sidebar-nav.component.html",
  styleUrls: ["./sidebar-nav.component.scss"],
})
export class SidebarNavComponent implements OnInit {
  public selectedIndex: number = 0;

  constructor() {}

  ngOnInit(): void {}
}
