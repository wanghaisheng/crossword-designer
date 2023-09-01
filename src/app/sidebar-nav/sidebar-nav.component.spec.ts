import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SidebarNavComponent } from "./sidebar-nav.component";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { LoadService } from "../services/load.service";

describe("SidebarNavComponent", () => {
  let component: SidebarNavComponent;
  let fixture: ComponentFixture<SidebarNavComponent>;

  const routerSpy = jasmine.createSpyObj("RouterService", ["navigateByUrl"]);
  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["activePuzzleId$"]);

  beforeEach(async () => {
    loadServiceSpy.activePuzzleId$ = new BehaviorSubject("");

    await TestBed.configureTestingModule({
      declarations: [SidebarNavComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: LoadService, useValue: loadServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarNavComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should set puzzle loaded to false when puzzleId empty", () => {
      loadServiceSpy.activePuzzleId$.next("");

      fixture.detectChanges();
      expect(component.puzzleLoaded).toEqual(false);
    });

    it("should set puzzle loaded to true when puzzleId", () => {
      loadServiceSpy.activePuzzleId$.next("puzzleId");

      fixture.detectChanges();
      expect(component.puzzleLoaded).toEqual(true);
    });
  });
});
