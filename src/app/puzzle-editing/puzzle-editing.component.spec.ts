import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PuzzleEditingComponent } from "./puzzle-editing.component";
import { Puzzle, PuzzleService, Square } from "../services/puzzle.service";
import { BehaviorSubject, of, throwError } from "rxjs";
import { LoadService } from "../services/load.service";
import { EditMode, HighlightMode } from "../components/grid/grid.component";

describe("PuzzleEditingComponent", () => {
  let component: PuzzleEditingComponent;
  let fixture: ComponentFixture<PuzzleEditingComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "loadPuzzle", "savePuzzle", "clearPuzzle"]);
  const loadServiceSpy = jasmine.createSpyObj("LoadService", ["activePuzzleId$"]);

  const testId = "testId";

  const testPuzzle: Puzzle = {
    id: testId,
    name: "Test",
    width: 4,
    height: 5,
    grid: Array.from(Array(20).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 4), i % 4)),
    acrossClues: [],
    downClues: [],
  };

  beforeEach(async () => {
    loadServiceSpy.activePuzzleId$ = new BehaviorSubject<string>(testId);

    puzzleServiceSpy.puzzle = testPuzzle;
    puzzleServiceSpy.loadPuzzle.and.returnValue(of(false));
    puzzleServiceSpy.savePuzzle.and.returnValue(of(undefined));

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      declarations: [PuzzleEditingComponent],
      providers: [
        { provide: PuzzleService, useValue: puzzleServiceSpy },
        { provide: LoadService, useValue: loadServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleEditingComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should do nothing when loadPuzzle returns true", () => {
      puzzleServiceSpy.loadPuzzle.and.returnValue(of(true));

      fixture.detectChanges();

      expect(puzzleServiceSpy.loadPuzzle).toHaveBeenCalledWith(testId);
      expect(window.alert).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalledWith("Something went wrong during puzzle load...");
      expect(component.puzzleLoaded).toEqual(true);
    });

    it("should log error when loadPuzzle returns false", () => {
      puzzleServiceSpy.loadPuzzle.and.returnValue(of(false));

      fixture.detectChanges();

      expect(puzzleServiceSpy.loadPuzzle).toHaveBeenCalledWith(testId);
      expect(console.error).toHaveBeenCalledWith("Something went wrong during puzzle load...");
    });

    it("should alert failure when loadPuzzle throws error", () => {
      const errorMsg = "Failed to get doc";
      puzzleServiceSpy.loadPuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      fixture.detectChanges();

      expect(puzzleServiceSpy.loadPuzzle).toHaveBeenCalledWith(testId);
      expect(window.alert).toHaveBeenCalledWith("Puzzle load failed: Failed to get doc");
    });
  });

  describe("onUpdateConfig", () => {
    it("should emit new puzzle configuration", () => {
      spyOn(component.gridConfig$, "next");

      component.answersHidden = true;
      component.editMode = EditMode.Circle;
      component.highlightMode = HighlightMode.Down;
      component.onUpdateConfig();

      expect(component.gridConfig$.next).toHaveBeenCalledWith({
        readonly: false,
        answersHidden: true,
        editMode: EditMode.Circle,
        highlightMode: HighlightMode.Down,
      });
    });
  });

  describe("onSave", () => {
    it("should do nothing when savePuzzle success", () => {
      component.onSave();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    it("should alert failure when savePuzzle throws error", () => {
      const errorMsg = "Failed to set doc";
      puzzleServiceSpy.savePuzzle.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      component.onSave();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Puzzle failed to save: Failed to set doc");
    });
  });

  describe("onClear", () => {
    it("should call clearPuzzle", () => {
      component.onClear();

      expect(puzzleServiceSpy.clearPuzzle).toHaveBeenCalled();
    });
  });
});
