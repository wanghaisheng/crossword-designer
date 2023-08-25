import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LoadPuzzleComponent } from "./load-puzzle.component";
import { PuzzleService } from "../services/puzzle.service";
import { of } from "rxjs";

describe("LoadPuzzleComponent", () => {
  let component: LoadPuzzleComponent;
  let fixture: ComponentFixture<LoadPuzzleComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["getPuzzleList", "activatePuzzle", "createPuzzle"]);

  beforeEach(async () => {
    puzzleServiceSpy.getPuzzleList.and.returnValue(of([]));
    puzzleServiceSpy.createPuzzle.and.returnValue(of(true));
    puzzleServiceSpy.activatePuzzle.and.returnValue(of(true));
    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      declarations: [LoadPuzzleComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
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
    it("should successfully activate puzzle", () => {
      component.loadPuzzleForm.value.id = "test-id";

      fixture.detectChanges();
      component.loadPuzzle();

      expect(puzzleServiceSpy.activatePuzzle).toHaveBeenCalledWith("test-id");
      expect(window.alert).toHaveBeenCalledWith("Puzzle loaded successfully!");
    });

    it("should not successfully activate puzzle", () => {
      puzzleServiceSpy.activatePuzzle.and.returnValue(of(false));
      component.loadPuzzleForm.value.id = "test-id";

      fixture.detectChanges();
      component.loadPuzzle();

      expect(puzzleServiceSpy.activatePuzzle).toHaveBeenCalledWith("test-id");
      expect(window.alert).toHaveBeenCalledWith("Puzzle load failed");
    });
  });

  describe("createPuzzle", () => {
    it("should successfully create and activate puzzle", () => {
      component.newPuzzleForm.value.title = "New Puzzle";
      component.newPuzzleForm.value.width = 10;
      component.newPuzzleForm.value.height = 12;

      fixture.detectChanges();
      component.createPuzzle();

      expect(puzzleServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).toHaveBeenCalledWith("Puzzle created successfully!");
    });

    it("should not successfully create and activate puzzle", () => {
      puzzleServiceSpy.createPuzzle.and.returnValue(of(false));
      component.newPuzzleForm.value.title = "New Puzzle";
      component.newPuzzleForm.value.width = 10;
      component.newPuzzleForm.value.height = 12;

      fixture.detectChanges();
      component.createPuzzle();

      expect(puzzleServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(window.alert).toHaveBeenCalledWith("Puzzle creation failed");
    });
  });
});
