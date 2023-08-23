import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";

import { EditMode, HighlightMode, PuzzleGridComponent } from "./puzzle-grid.component";
import { OverlayType, Puzzle, PuzzleService, Square } from "../services/puzzle.service";
import { BehaviorSubject, of } from "rxjs";
import { DebugElement, EventEmitter } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("PuzzleGridComponent", () => {
  let component: PuzzleGridComponent;
  let fixture: ComponentFixture<PuzzleGridComponent>;
  let squareEls: Array<DebugElement>;
  let tableEl: DebugElement;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", [
    "activeGrid$",
    "messenger",
    "getPuzzleList",
    "activatePuzzle",
    "createPuzzle",
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

  const newTestPuzzle: Puzzle = {
    id: "new-test-id",
    name: "New Test",
    width: 10,
    height: 12,
    grid: Array.from(Array(120).keys()).map((i) => new Square(i, "", -1, Math.floor(i / 10), i % 10)),
    acrossClues: [],
    downClues: [],
  };

  beforeEach(async () => {
    puzzleServiceSpy.activeGrid$ = new BehaviorSubject(testPuzzle.grid);
    puzzleServiceSpy.messenger = new EventEmitter<string>();
    puzzleServiceSpy.getPuzzleList.and.returnValue(of([]));
    puzzleServiceSpy.activatePuzzle.and.returnValue(of(testPuzzle));
    puzzleServiceSpy.createPuzzle.and.returnValue(of(newTestPuzzle));
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
      declarations: [PuzzleGridComponent],
      providers: [{ provide: PuzzleService, useValue: puzzleServiceSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  describe("loadPuzzle", () => {
    it("should activate puzzle", () => {
      component.loadPuzzleForm.value.id = "test-id";

      fixture.detectChanges();
      component.loadPuzzle();

      expect(puzzleServiceSpy.activatePuzzle).toHaveBeenCalledWith("test-id");
      expect(component.numRows).toEqual(5);
      expect(component.numCols).toEqual(4);
      expect(component.puzzleLoaded).toEqual(true);
    });
  });

  describe("createPuzzle", () => {
    it("should activate puzzle", () => {
      component.newPuzzleForm.value.title = "New Puzzle";
      component.newPuzzleForm.value.width = 10;
      component.newPuzzleForm.value.height = 12;

      fixture.detectChanges();
      component.createPuzzle();

      expect(puzzleServiceSpy.createPuzzle).toHaveBeenCalledWith("New Puzzle", 10, 12);
      expect(component.numRows).toEqual(12);
      expect(component.numCols).toEqual(10);
      expect(component.puzzleLoaded).toEqual(true);
    });
  });

  describe("onClickSquare", () => {
    beforeEach(() => {
      component.loadPuzzle();
      fixture.detectChanges();

      squareEls = fixture.debugElement.queryAll(By.css(".square"));
    });

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
