import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ClueEditingComponent } from "./clue-editing.component";
import { Clue, ClueType, Puzzle, PuzzleService, Square } from "../services/puzzle.service";
import { FormArray, ReactiveFormsModule } from "@angular/forms";
import { of, throwError } from "rxjs";

describe("ClueEditingComponent", () => {
  let component: ClueEditingComponent;
  let fixture: ComponentFixture<ClueEditingComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "savePuzzle", "clearPuzzle", "setClueText"]);

  const testId = "testId";
  const testPuzzle: Puzzle = {
    id: testId,
    name: "Test",
    createdBy: "test-user-id",
    width: 2,
    height: 2,
    locked: false,
    grid: Array.from(Array(4).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 2), i % 2)),
    acrossClues: [new Clue(1, "Hello, I'm an across clue!", "HI", [0, 1]), new Clue(2)],
    downClues: [new Clue(1, "Hello, I'm a down clue!", "HI", [0, 2]), new Clue(2)],
  };

  beforeEach(async () => {
    puzzleServiceSpy.puzzle = testPuzzle;
    puzzleServiceSpy.savePuzzle.and.returnValue(of(undefined));
    puzzleServiceSpy.setClueText.calls.reset();

    spyOn(window, "alert");

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ClueEditingComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClueEditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("updateAcrossClue", () => {
    it("should call setClueText with new clue text", () => {
      const control = (component.cluesForm.get("across") as FormArray).at(0);
      control.patchValue("New across clue!");
      control.markAsDirty();

      component.updateAcrossClue(0);

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Across, 1, "New across clue!");
    });

    it("should do nothing if control pristine", () => {
      const control = (component.cluesForm.get("across") as FormArray).at(0);
      control.markAsPristine();

      component.updateAcrossClue(0);

      expect(puzzleServiceSpy.setClueText).not.toHaveBeenCalled();
    });
  });

  describe("updateDownClue", () => {
    it("should call setClueText with new clue text", () => {
      const control = (component.cluesForm.get("down") as FormArray).at(0);
      control.patchValue("New down clue!");
      control.markAsDirty();

      component.updateDownClue(0);

      expect(puzzleServiceSpy.setClueText).toHaveBeenCalledWith(ClueType.Down, 1, "New down clue!");
    });

    it("should do nothing if control pristine", () => {
      const control = (component.cluesForm.get("down") as FormArray).at(0);
      control.markAsPristine();

      component.updateDownClue(0);

      expect(puzzleServiceSpy.setClueText).not.toHaveBeenCalled();
    });
  });

  describe("onSave", () => {
    it("should call savePuzzle", () => {
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
      expect(window.alert).toHaveBeenCalledWith("Clues failed to save: Failed to set doc");
    });
  });

  describe("onClear", () => {
    it("should call clearPuzzle", () => {
      component.onClear();

      expect(puzzleServiceSpy.clearPuzzle).toHaveBeenCalled();
    });
  });
});
