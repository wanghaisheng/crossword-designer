import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditMode, HighlightMode, GridComponent } from "./grid.component";
import { OverlayType, Puzzle, PuzzleService, Square } from "src/app/services/puzzle.service";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("PuzzleComponent", () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;
  let squareEls: Array<DebugElement>;
  let tableEl: DebugElement;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", [
    "puzzle",
    "selectSquare",
    "toggleSquareType",
    "toggleSquareOverlay",
    "loadPuzzle",
    "savePuzzle",
    "clearPuzzle",
    "setSquareValue",
    "getFirstLetterIndex",
    "getNextIndex",
    "getPrevIndex",
    "isPuzzleEnd",
    "isPuzzleStart",
  ]);

  const testId = "testId";

  const testPuzzle: Puzzle = {
    id: testId,
    name: "Test",
    width: 4,
    height: 5,
    locked: false,
    grid: Array.from(Array(20).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 4), i % 4)),
    acrossClues: [],
    downClues: [],
  };

  beforeEach(async () => {
    puzzleServiceSpy.puzzle = testPuzzle;
    puzzleServiceSpy.isPuzzleStart.and.returnValue(false);
    puzzleServiceSpy.isPuzzleEnd.and.returnValue(false);
    puzzleServiceSpy.selectSquare.calls.reset();

    puzzleServiceSpy.getNextIndex.and.callFake((index: number, vertical: boolean, skipSpacers: boolean = false) => {
      if (vertical) return index + testPuzzle.width;
      else return index + 1;
    });
    puzzleServiceSpy.getPrevIndex.and.callFake((index: number, vertical: boolean, skipSpacers: boolean = false) => {
      if (vertical) return index - testPuzzle.width;
      else return index - 1;
    });
    puzzleServiceSpy.getFirstLetterIndex.and.returnValue(0);

    await TestBed.configureTestingModule({
      declarations: [GridComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    tableEl = fixture.debugElement.query(By.css("table"));
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("onClickSquare", () => {
    beforeEach(() => {
      fixture.detectChanges();
      squareEls = fixture.debugElement.queryAll(By.css(".square"));
    });

    it("should select square when edit mode is Value", () => {
      component.config.editMode = EditMode.Value;

      squareEls[0].triggerEventHandler("click", undefined);
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(0);
    });

    it("should toggle square type when edit mode is Spacer", () => {
      component.config.editMode = EditMode.Spacer;

      squareEls[1].triggerEventHandler("click", undefined);
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
      expect(puzzleServiceSpy.toggleSquareType).toHaveBeenCalledWith(1);
    });

    it("should toggle overlay when edit mode is Circle", () => {
      component.config.editMode = EditMode.Circle;

      squareEls[2].nativeElement.dispatchEvent(new Event("click"));
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(2);
      expect(puzzleServiceSpy.toggleSquareOverlay).toHaveBeenCalledWith(2, OverlayType.Circle);
    });

    it("should toggle overlay when edit mode is Shade", () => {
      component.config.editMode = EditMode.Shade;

      squareEls[3].triggerEventHandler("click", undefined);
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(3);
      expect(puzzleServiceSpy.toggleSquareOverlay).toHaveBeenCalledWith(3, OverlayType.Shade);
    });

    it("should set square type when overrideMode provided", () => {
      component.config.editMode = EditMode.Circle;

      component.onClickSquare(4, EditMode.Spacer);

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(4);
      expect(puzzleServiceSpy.toggleSquareType).toHaveBeenCalledWith(4);
    });
  });

  describe("onKeyDown", () => {
    it("should call select next index when arrow key", () => {
      component.config.editMode = EditMode.Value;
      component.selectedIndex = 0;

      tableEl.triggerEventHandler("keydown", { key: "ArrowDown" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.getNextIndex).toHaveBeenCalledWith(0, true, true);
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(4);
    });

    it("should set square to Spacer and select next when enter and edit mode is Value", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Across;
      component.selectedIndex = 4;

      tableEl.triggerEventHandler("keydown", { key: "Enter" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.toggleSquareType).toHaveBeenCalledWith(4);
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(5);
    });

    it("should toggle overlay type when enter and edit mode is Circle", () => {
      component.config.editMode = EditMode.Circle;
      component.selectedIndex = 1;

      tableEl.triggerEventHandler("keydown", { key: "Enter" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.toggleSquareOverlay).toHaveBeenCalledWith(1, OverlayType.Circle);
    });

    it("should set square value to space and select previous square when backspace and highlight mode Across", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Across;
      component.selectedIndex = 2;

      tableEl.triggerEventHandler("keydown", { key: "Backspace" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(2, " ");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
    });

    it("should set square value to space and select previous square when backspace and highlight mode Down", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Down;
      component.selectedIndex = 5;

      tableEl.triggerEventHandler("keydown", { key: "Backspace" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(5, " ");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
    });

    it("should set square value and not select previous square when backspace and puzzle start", () => {
      puzzleServiceSpy.isPuzzleStart.and.returnValue(true);
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Down;
      component.selectedIndex = 3;

      tableEl.triggerEventHandler("keydown", { key: "Backspace" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(3, " ");
      expect(puzzleServiceSpy.selectSquare).not.toHaveBeenCalled();
    });

    it("should set square value and select next square when alphanumeric char and highlight mode Across", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Across;
      component.selectedIndex = 0;

      tableEl.triggerEventHandler("keydown", { key: "X" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(0, "X");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
    });

    it("should set square value and select next square when alphanumeric char and highlight mode Down", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Down;
      component.selectedIndex = 0;

      tableEl.triggerEventHandler("keydown", { key: "X" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(0, "X");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(4);
    });

    it("should set square value and not select next square when alphanumeric char and puzzle end", () => {
      puzzleServiceSpy.isPuzzleEnd.and.returnValue(true);
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Down;
      component.selectedIndex = 19;

      tableEl.triggerEventHandler("keydown", { key: "X" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(19, "X");
      expect(puzzleServiceSpy.selectSquare).not.toHaveBeenCalled();
    });
  });

  describe("isHighlighted", () => {
    it("should return true when highlight mode is Across and in across answer", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Across;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[1])).toEqual(true);
    });

    it("should return true when highlight mode is Down and in down answer", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Down;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[4])).toEqual(true);
    });

    it("should return true when highlight mode is Intersect and in across or down answer", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Intersect;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[1])).toEqual(true);
      expect(component.isHighlighted(component.puzzleGrid[4])).toEqual(true);
    });

    it("should return false when highlight mode is Intersect and not in across or down answer", () => {
      component.config.editMode = EditMode.Value;
      component.config.highlightMode = HighlightMode.Intersect;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[5])).toEqual(false);
    });

    it("should return false when edit mode is not Value", () => {
      component.config.editMode = EditMode.Spacer;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[0])).toEqual(false);
    });
  });
});
