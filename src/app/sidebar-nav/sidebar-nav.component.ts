import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";
import { LoadService } from "../services/load.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-sidebar-nav",
  templateUrl: "./sidebar-nav.component.html",
  styleUrls: ["./sidebar-nav.component.scss"],
})
export class SidebarNavComponent implements OnInit {
  @ViewChildren("pageLink") pageLinks!: QueryList<ElementRef>;

  public puzzleLoaded: boolean = false;
  public pages: Array<any> = [];

  private routes: Array<string> = ["/load", "/answers", "/puzzle", "/clues", "/review", "/stats"];
  private iconSize: string = "20";

  constructor(private router: Router, private loadService: LoadService) {
    this.pages = [
      {
        index: 0,
        route: this.routes[0],
        title: "Load or Create Puzzle",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" fill="currentColor" class="bi bi-files" viewBox="0 0 16 16">
          <path d="M13 0H6a2 2 0 0 0-2 2 2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm0 13V4a2 2 0 0 0-2-2H5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1zM3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z" />
          </svg>`,
      },
      {
        index: 1,
        route: this.routes[1],
        title: "Brainstorm Answers",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" fill="currentColor" class="bi bi-journal-text" viewBox="0 0 16 16">
          <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
          <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z" />
          <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z" />
          </svg>`,
      },
      {
        index: 2,
        route: this.routes[2],
        title: "Edit Puzzle",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" fill="currentColor" class="bi bi-grid-3x3" viewBox="0 0 16 16">
          <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13zM1.5 1a.5.5 0 0 0-.5.5V5h4V1H1.5zM5 6H1v4h4V6zm1 4h4V6H6v4zm-1 1H1v3.5a.5.5 0 0 0 .5.5H5v-4zm1 0v4h4v-4H6zm5 0v4h3.5a.5.5 0 0 0 .5-.5V11h-4zm0-1h4V6h-4v4zm0-5h4V1.5a.5.5 0 0 0-.5-.5H11v4zm-1 0V1H6v4h4z" />
          </svg>`,
      },
      {
        index: 3,
        route: this.routes[3],
        title: "Edit Clues",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" fill="currentColor" class="bi bi-list-ol" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z" />
          <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z" />
          </svg>`,
      },
      {
        index: 4,
        route: this.routes[4],
        title: "Review Puzzle",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
          </svg>`,
      },
      {
        index: 5,
        route: this.routes[5],
        title: "View Puzzle Statistics",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" fill="currentColor" class="bi bi-bar-chart" viewBox="0 0 16 16">
          <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5v12h-2V2h2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
          </svg>`,
      },
    ];
  }

  ngOnInit(): void {
    this.router.navigateByUrl(this.routes[0]);

    this.loadService.activePuzzleId$.subscribe((id: string) => {
      this.puzzleLoaded = id ? true : false;
    });
  }

  ngAfterViewInit() {
    let links = this.pageLinks.toArray();

    // Set icon
    links.forEach((link, index) => {
      let elt = link.nativeElement.firstChild;
      elt.innerHTML = this.pages[index].icon;
    });
  }
}
