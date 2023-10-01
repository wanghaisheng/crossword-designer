import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PuzzleReviewComponent } from "./puzzle-review.component";
import { BehaviorSubject, of, throwError } from "rxjs";
import { Puzzle, PuzzleService, Square } from "../services/puzzle.service";
import { LoadService } from "../services/load.service";

describe("PuzzleReviewComponent", () => {
  let component: PuzzleReviewComponent;
  let fixture: ComponentFixture<PuzzleReviewComponent>;

  const puzzleServiceSpy = jasmine.createSpyObj("PuzzleService", ["puzzle", "loadPuzzle"]);
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

    spyOn(window, "alert");
    spyOn(console, "error");

    await TestBed.configureTestingModule({
      declarations: [PuzzleReviewComponent],
      providers: [
        { provide: PuzzleService, useValue: puzzleServiceSpy },
        { provide: LoadService, useValue: loadServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
