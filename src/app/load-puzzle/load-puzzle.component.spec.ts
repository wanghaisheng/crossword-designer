import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadPuzzleComponent } from "./load-puzzle.component";
import { of } from "rxjs";
import { TestPuzzle } from "src/environments/environment";
import { LoadService } from "../services/load.service";
import { ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";

describe("LoadPuzzleComponent", () => {
  let component: LoadPuzzleComponent;
  let fixture: ComponentFixture<LoadPuzzleComponent>;

  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["setActiveId", "createPuzzle", "getPuzzleList"]);
  const routerSpy = jasmine.createSpyObj("RouterService", ["navigateByUrl"]);

  beforeEach(async () => {
    loadServiceSpy.getPuzzleList.and.returnValue(of([TestPuzzle]));
    loadServiceSpy.createPuzzle.and.returnValue(of(true));
    loadServiceSpy.setActiveId.calls.reset();
    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LoadPuzzleComponent],
      providers: [
        { provide: LoadService, useValue: loadServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadPuzzleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("loadPuzzle", () => {
    it("should call loadPuzzle with id", () => {
      component.loadPuzzle("test-id");

      expect(loadServiceSpy.setActiveId).toHaveBeenCalledWith("test-id");
    });

    it("should not call loadPuzzle if id empty", () => {
      component.loadPuzzle("");

      expect(loadServiceSpy.setActiveId).not.toHaveBeenCalled();
    });
  });

  describe("createPuzzle", () => {
    it("should alert success when puzzle successfully created and activated", () => {
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).toHaveBeenCalledWith("Puzzle created successfully!");
    });

    it("should alert failure when puzzle not successfully created and activated", () => {
      loadServiceSpy.createPuzzle.and.returnValue(of(false));
      component.newPuzzleForm.setValue({ title: "New Puzzle", width: 10, height: 12 });

      fixture.detectChanges();
      component.createPuzzle();

      expect(loadServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).toHaveBeenCalledWith("Puzzle creation failed");
    });
  });
});
