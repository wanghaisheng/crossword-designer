import { Component, OnInit } from "@angular/core";
import { LoadService } from "../services/load.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-sidebar-nav",
  templateUrl: "./sidebar-nav.component.html",
  styleUrls: ["./sidebar-nav.component.scss"],
})
export class SidebarNavComponent implements OnInit {
  public puzzleLoaded: boolean = false;

  constructor(private router: Router, private loadService: LoadService) {}

  ngOnInit(): void {
    this.router.navigateByUrl("/load");

    this.loadService.activePuzzleId$.subscribe((id: string) => {
      this.puzzleLoaded = id ? true : false;
    });
  }
}
