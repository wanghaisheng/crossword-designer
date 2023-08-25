import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EditMode, HighlightMode, PuzzleEditingComponent } from "./puzzle-editing.component";
import { OverlayType, Puzzle, PuzzleService, Square } from "../services/puzzle.service";
import { BehaviorSubject } from "rxjs";
import { DebugElement, EventEmitter } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("PuzzleGridComponent", () => {
  let component: PuzzleEditingComponent;
  let fixture: ComponentFixture<PuzzleEditingComponent>;
  let squareEls: Array<DebugElement>;
  let tableEl: DebugElement;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", [
    "activeGrid$",
    "messenger",
    "selectSquare",
    "toggleSquareType",
    "toggleSquareOverlay",
    "savePuzzle",
    "clearPuzzle",
    "setSquareValue",
    "getNextIndex",
    "getPrevIndex",
    "isPuzzleEnd",
    "isPuzzleStart",
  ]);

  const testPuzzle: Puzzle = {
    id: "test-id",
    name: "Test",
    width: 4,
    height: 5,
    grid: Array.from(Array(20).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 4), i % 4)),
    acrossClues: [],
    downClues: [],
  };

  beforeEach(async () => {
    puzzleServiceSpy.activePuzzle$ = new BehaviorSubject(testPuzzle);
    puzzleServiceSpy.messenger = new EventEmitter<string>();
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

    await TestBed.configureTestingModule({
      declarations: [PuzzleEditingComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleEditingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    squareEls = fixture.debugElement.queryAll(By.css(".square"));
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select square when message clear", () => {
      puzzleServiceSpy.messenger.next("clear");

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(0);
    });

    it("should do nothing when message not clear", () => {
      puzzleServiceSpy.messenger.next("save");

      expect(puzzleServiceSpy.selectSquare).not.toHaveBeenCalled();
    });
  });

  describe("onClickSquare", () => {
    it("should select square when edit mode is Value", () => {
      component.editMode = EditMode.Value;

      squareEls[0].triggerEventHandler("click", undefined);
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(0);
    });

    it("should toggle square type when edit mode is Spacer", () => {
      component.editMode = EditMode.Spacer;

      squareEls[1].triggerEventHandler("click", undefined);
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
      expect(puzzleServiceSpy.toggleSquareType).toHaveBeenCalledWith(1);
    });

    it("should toggle overlay when edit mode is Circle", () => {
      component.editMode = EditMode.Circle;

      squareEls[2].nativeElement.dispatchEvent(new Event("click"));
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(2);
      expect(puzzleServiceSpy.toggleSquareOverlay).toHaveBeenCalledWith(2, OverlayType.Circle);
    });

    it("should toggle overlay when edit mode is Shade", () => {
      component.editMode = EditMode.Shade;

      squareEls[3].triggerEventHandler("click", undefined);
      fixture.detectChanges();

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(3);
      expect(puzzleServiceSpy.toggleSquareOverlay).toHaveBeenCalledWith(3, OverlayType.Shade);
    });

    it("should set square type when overrideMode provided", () => {
      component.editMode = EditMode.Circle;

      component.onClickSquare(4, EditMode.Spacer);

      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(4);
      expect(puzzleServiceSpy.toggleSquareType).toHaveBeenCalledWith(4);
    });
  });

  describe("onKeyDown", () => {
    beforeEach(() => {
      component.puzzleLoaded = true;
      fixture.detectChanges();

      tableEl = fixture.debugElement.query(By.css("table"));
    });

    it("should call select next index when arrow key", () => {
      component.editMode = EditMode.Value;
      component.selectedIndex = 0;

      tableEl.triggerEventHandler("keydown", { key: "ArrowDown" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.getNextIndex).toHaveBeenCalledWith(0, true, true);
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(4);
    });

    it("should set square to Spacer and select next when enter and edit mode is Value", () => {
      component.editMode = EditMode.Value;
      component.selectedIndex = 4;

      tableEl.triggerEventHandler("keydown", { key: "Enter" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.toggleSquareType).toHaveBeenCalledWith(4);
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(5);
    });

    it("should toggle overlay type when enter and edit mode is Circle", () => {
      component.editMode = EditMode.Circle;
      component.selectedIndex = 1;

      tableEl.triggerEventHandler("keydown", { key: "Enter" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.toggleSquareOverlay).toHaveBeenCalledWith(1, OverlayType.Circle);
    });

    it("should set square value to space and select previous square when backspace and highlight mode Across", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Across;
      component.selectedIndex = 2;

      tableEl.triggerEventHandler("keydown", { key: "Backspace" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(2, " ");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
    });

    it("should set square value to space and select previous square when backspace and highlight mode Down", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Down;
      component.selectedIndex = 5;

      tableEl.triggerEventHandler("keydown", { key: "Backspace" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(5, " ");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
    });

    it("should set square value and not select previous square when backspace and puzzle start", () => {
      puzzleServiceSpy.isPuzzleStart.and.returnValue(true);
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Down;
      component.selectedIndex = 3;

      tableEl.triggerEventHandler("keydown", { key: "Backspace" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(3, " ");
      expect(puzzleServiceSpy.selectSquare).not.toHaveBeenCalled();
    });

    it("should set square value and select next square when alphanumeric char and highlight mode Across", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Across;
      component.selectedIndex = 0;

      tableEl.triggerEventHandler("keydown", { key: "X" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(0, "X");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(1);
    });

    it("should set square value and select next square when alphanumeric char and highlight mode Down", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Down;
      component.selectedIndex = 0;

      tableEl.triggerEventHandler("keydown", { key: "X" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(0, "X");
      expect(puzzleServiceSpy.selectSquare).toHaveBeenCalledWith(4);
    });

    it("should set square value and not select next square when alphanumeric char and puzzle end", () => {
      puzzleServiceSpy.isPuzzleEnd.and.returnValue(true);
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Down;
      component.selectedIndex = 19;

      tableEl.triggerEventHandler("keydown", { key: "X" });
      fixture.detectChanges();

      expect(puzzleServiceSpy.setSquareValue).toHaveBeenCalledWith(19, "X");
      expect(puzzleServiceSpy.selectSquare).not.toHaveBeenCalled();
    });
  });

  describe("saveGrid", () => {
    it("should call savePuzzle", () => {
      component.saveGrid();

      expect(puzzleServiceSpy.savePuzzle).toHaveBeenCalled();
    });
  });

  describe("clearGrid", () => {
    it("should call clearPuzzle", () => {
      component.clearGrid();

      expect(puzzleServiceSpy.clearPuzzle).toHaveBeenCalled();
    });
  });

  describe("isHighlighted", () => {
    it("should return true when highlight mode is Across and in across answer", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Across;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[1])).toEqual(true);
    });

    it("should return true when highlight mode is Down and in down answer", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Down;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[4])).toEqual(true);
    });

    it("should return true when highlight mode is Intersect and in across or down answer", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Intersect;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[1])).toEqual(true);
      expect(component.isHighlighted(component.puzzleGrid[4])).toEqual(true);
    });

    it("should return false when highlight mode is Intersect and not in across or down answer", () => {
      component.editMode = EditMode.Value;
      component.highlightMode = HighlightMode.Intersect;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[5])).toEqual(false);
    });

    it("should return false when edit mode is not Value", () => {
      component.editMode = EditMode.Spacer;
      component.selectedIndex = 0;

      expect(component.isHighlighted(component.puzzleGrid[0])).toEqual(false);
    });
  });
});
