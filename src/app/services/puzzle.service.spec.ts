import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { TestPuzzle, environment } from "src/environments/environment";

import { provideAnalytics, getAnalytics, ScreenTrackingService, UserTrackingService } from "@angular/fire/analytics";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { provideFunctions, getFunctions } from "@angular/fire/functions";
import { provideStorage, getStorage } from "@angular/fire/storage";

import { TestBed } from "@angular/core/testing";

import { Clue, ClueType, OverlayType, Puzzle, PuzzleService, Square, SquareType } from "./puzzle.service";
import { of } from "rxjs";

describe("PuzzleService", () => {
  const testPuzzleId = "test";

  let service: PuzzleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAnalytics(() => getAnalytics()),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        provideFunctions(() => getFunctions()),
        provideStorage(() => getStorage()),
      ],
      providers: [ScreenTrackingService, UserTrackingService],
      teardown: { destroyAfterEach: false },
    });

    service = TestBed.inject(PuzzleService);

    spyOn(service, "loadPuzzle").and.returnValue(of(TestPuzzle));
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("activatePuzzle", () => {
    it("should number squares and return true when successful", () => {
      service.activatePuzzle(testPuzzleId).subscribe((response) => {
        expect(response).toEqual(true);
      });

      service.activePuzzle$.subscribe((puzzle) => {
        expect(puzzle.grid[0]).toEqual(new Square(0, "Y", 1, 1, 1));
        expect(puzzle.grid[198]).toEqual(new Square(198, "U", -1, 63, 50));
        expect(puzzle.grid[223]).toEqual(new Square(223, "", -1, -1, -1, SquareType.Spacer));
        expect(puzzle.grid[440]).toEqual(new Square(440, "X", -1, 128, 122));
      });
    });

    it("should associate clues and return true when successful", () => {
      service.activatePuzzle(testPuzzleId).subscribe((response) => {
        const acrossClues = service.getActiveAcross();
        const downClues = service.getActiveDown();

        expect(response).toEqual(true);

        expect(acrossClues[0]).toEqual(new Clue(1, "It's not that simple", "YESANDNO", [0, 1, 2, 3, 4, 5, 6, 7]));
        expect(downClues[0]).toEqual(new Clue(1, "Sharp bark", "YIP", [0, 21, 42]));

        expect(acrossClues[5]).toEqual(new Clue(21, "Reading can be found on it", "THAMES", [36, 37, 38, 39, 40, 41]));
        expect(downClues[18]).toEqual(new Clue(22, "Mouthing off", "SASS", [41, 62, 83, 104]));

        expect(acrossClues[10]).toEqual(new Clue(28, "Pirate fodder, once", "BLANKCDS", [76, 77, 78, 79, 80, 81, 82, 83]));
        expect(downClues[20]).toEqual(new Clue(29, "", "LAY", [77, 98, 119]));

        expect(acrossClues[21]).toEqual(new Clue(50, "", "ASSETS", [156, 157, 158, 159, 160, 161]));
        expect(downClues[34]).toEqual(new Clue(50, "", "ATUL", [156, 177, 198, 219]));

        expect(acrossClues[60]).toEqual(new Clue(128, "", "TOTHEMAX", [433, 434, 435, 436, 437, 438, 439, 440]));
        expect(downClues[78]).toEqual(new Clue(122, "", "SEX", [398, 419, 440]));
      });
    });
  });

  describe("clearPuzzle", () => {
    it("should clear puzzle", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        const grid = service.getActiveGrid();
        const acrossClues = service.getActiveAcross();

        expect(grid[0]).toEqual(new Square(0, "Y", 1, 1, 1));
        expect(grid[8]).toEqual(new Square(8, "", -1, -1, -1, SquareType.Spacer));
        expect(acrossClues[0]).toEqual(new Clue(1, "It's not that simple", "YESANDNO", [0, 1, 2, 3, 4, 5, 6, 7]));

        service.clearPuzzle();
      });

      service.activePuzzle$.subscribe((puzzle) => {
        expect(puzzle.grid[0]).toEqual(new Square(0, " ", 1, 1, 1));
        expect(puzzle.grid[8]).toEqual(new Square(8, " ", 9, 1, 9));
      });

      service.activeAcrossClue$.subscribe((clue) => {
        expect(clue.index).toEqual(1);
        expect(clue.answer).toEqual(Array(21).fill(" ").join(""));
      });

      service.activeDownClue$.subscribe((clue) => {
        expect(clue.index).toEqual(1);
        expect(clue.answer).toEqual(Array(21).fill(" ").join(""));
      });
    });
  });

  describe("selectSquare", () => {
    it("should select letter square", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.selectSquare(3);
      });

      service.activeAcrossClue$.subscribe((clue) => {
        expect(clue).toEqual(new Clue(1, "It's not that simple", "YESANDNO", [0, 1, 2, 3, 4, 5, 6, 7]));
      });

      service.activeDownClue$.subscribe((clue) => {
        expect(clue).toEqual(new Clue(4, "Draw", "ATTRACT", [3, 24, 45, 66, 87, 108, 129]));
      });
    });

    it("should select spacer square", () => {
      service.selectSquare(432);

      service.activeAcrossClue$.subscribe((clue) => {
        // TODO: not really sure what behavior I want here (do with bug #13)
      });

      service.activeDownClue$.subscribe((clue) => {
        // TODO: not really sure what behavior I want here
      });
    });
  });

  describe("toggleSquareType", () => {
    it("should create new across clues and displace down clue when toggling Letter to Spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareType(3);

        const grid = service.getActiveGrid();
        const acrossClues = service.getActiveAcross();
        const downClues = service.getActiveDown();

        expect(grid[3]).toEqual(new Square(3, "", -1, -1, -1, SquareType.Spacer));
        expect(acrossClues[0]).toEqual(new Clue(1, "", "YES", [0, 1, 2]));
        expect(acrossClues[1]).toEqual(new Clue(4, "", "NDNO", [4, 5, 6, 7]));
        expect(downClues[17]).toEqual(new Clue(19, "", "TTRACT", [24, 45, 66, 87, 108, 129]));

        expect(acrossClues.length).toEqual(63);
        expect(downClues.length).toEqual(79);
      });
    });

    it("should create new across clues and new down clues when toggling Letter to Spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareType(80);

        const grid = service.getActiveGrid();
        const acrossClues = service.getActiveAcross();
        const downClues = service.getActiveDown();

        expect(grid[80]).toEqual(new Square(80, "", -1, -1, -1, SquareType.Spacer));
        expect(acrossClues[10]).toEqual(new Clue(28, "", "BLAN", [76, 77, 78, 79]));
        expect(acrossClues[11]).toEqual(new Clue(30, "", "CDS", [81, 82, 83]));
        expect(downClues[15]).toEqual(new Clue(16, "", "TAL", [17, 38, 59]));
        expect(downClues[24]).toEqual(new Clue(37, "", "INCIRCLES", [101, 122, 143, 164, 185, 206, 227, 248, 269]));

        expect(acrossClues.length).toEqual(63);
        expect(downClues.length).toEqual(81);
      });
    });

    it("should not create new down or across clue when toggling Letter to Spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareType(104);

        const grid = service.getActiveGrid();
        const acrossClues = service.getActiveAcross();
        const downClues = service.getActiveDown();

        expect(grid[104]).toEqual(new Square(104, "", -1, -1, -1, SquareType.Spacer));
        expect(acrossClues[13]).toEqual(new Clue(35, "", "ARTIST", [98, 99, 100, 101, 102, 103]));
        expect(downClues[18]).toEqual(new Clue(22, "", "SAS", [41, 62, 83]));

        expect(acrossClues.length).toEqual(61);
        expect(downClues.length).toEqual(79);
      });
    });

    it("should remove across clues when toggling Spacer to Letter", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareType(29);

        const grid = service.getActiveGrid();
        const acrossClues = service.getActiveAcross();
        const downClues = service.getActiveDown();

        expect(grid[29]).toEqual(new Square(29, " ", 20, 19, 20));
        expect(acrossClues[3]).toEqual(new Clue(19, "", "IDITAROD ITPRO", [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]));
        expect(downClues[18]).toEqual(new Clue(20, "", " NOTED", [29, 50, 71, 92, 113, 134]));

        expect(acrossClues.length).toEqual(59);
        expect(downClues.length).toEqual(79);
      });
    });

    it("should remove down clue when toggling Spacer to Letter", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareType(86);

        const grid = service.getActiveGrid();
        const acrossClues = service.getActiveAcross();
        const downClues = service.getActiveDown();

        expect(grid[86]).toEqual(new Square(86, " ", 30, 30, 3));
        expect(acrossClues[11]).toEqual(new Clue(30, "", " AIDE", [86, 87, 88, 89, 90]));
        expect(downClues[2]).toEqual(new Clue(3, "", "SIRE ESTER", [2, 23, 44, 65, 86, 107, 128, 149, 170, 191]));

        expect(acrossClues.length).toEqual(61);
        expect(downClues.length).toEqual(77);
      });
    });
  });

  describe("toggleSquareOverlay", () => {
    it("should add overlay", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareOverlay(0, OverlayType.Circle);
      });

      service.activePuzzle$.subscribe((puzzle: Puzzle) => {
        expect(puzzle.grid[0]).toEqual(new Square(0, "Y", 1, 1, 1, SquareType.Letter, OverlayType.Circle));
      });
    });

    it("should remove overlay", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.toggleSquareOverlay(26, OverlayType.Circle);
      });

      service.activePuzzle$.subscribe((puzzle: Puzzle) => {
        expect(puzzle.grid[26]).toEqual(new Square(26, "R", -1, 19, 6, SquareType.Letter, OverlayType.None));
      });
    });
  });

  describe("setClueText", () => {
    it("should set across clue text", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.setClueText(ClueType.Across, 1, "TEST");

        const acrossClues = service.getActiveAcross();

        expect(acrossClues[0].text).toEqual("TEST");
      });
    });

    it("should set down clue text", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.setClueText(ClueType.Down, 9, "TEST");

        const downClues = service.getActiveDown();

        expect(downClues[8].text).toEqual("TEST");
      });
    });
  });

  describe("setSquareValue", () => {
    it("should set square value to new letter", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.setSquareValue(23, "x");

        service.activePuzzle$.subscribe((puzzle: Puzzle) => {
          expect(puzzle.grid[23].value).toEqual("X");
        });

        service.activeAcrossClue$.subscribe((clue) => {
          expect(clue.answer).toEqual("IDXTAROD");
        });

        service.activeDownClue$.subscribe((clue) => {
          expect(clue.answer).toEqual("SXRE");
        });
      });
    });

    it("should set square value to space", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        service.setSquareValue(440, " ");

        service.activePuzzle$.subscribe((puzzle: Puzzle) => {
          expect(puzzle.grid[440].value).toEqual(" ");
        });

        service.activeAcrossClue$.subscribe((clue) => {
          expect(clue.answer).toEqual("TOTHEMA ");
        });

        service.activeDownClue$.subscribe((clue) => {
          expect(clue.answer).toEqual("SE ");
        });
      });
    });
  });

  describe("getNextIndex", () => {
    it("should select first square to the right when vertical false and skipSpacers false", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getNextIndex(0, false, false)).toBe(1);
        expect(service.getNextIndex(431, false, false)).toBe(432);
      });
    });

    it("should select first number square to the right when vertical false and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getNextIndex(66, false, true)).toBe(70);
        expect(service.getNextIndex(370, false, true)).toBe(374);
      });
    });

    it("should select first number square in next row when on right edge, vertical false and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getNextIndex(19, false, true)).toBe(21);
        expect(service.getNextIndex(83, false, true)).toBe(87);
      });
    });

    it("should select first square below when vertical true and skipSpacers false", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getNextIndex(24, true, false)).toBe(45);
        expect(service.getNextIndex(390, true, false)).toBe(411);
      });
    });

    it("should select first number square below when vertical true and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getNextIndex(65, true, true)).toBe(107);
        expect(service.getNextIndex(5, true, true)).toBe(26);
      });
    });

    it("should select first number square in the current column when on bottom edge, vertical true and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getNextIndex(434, true, true)).toBe(77);
        expect(service.getNextIndex(440, true, true)).toBe(41);
      });
    });
  });

  describe("getPrevIndex", () => {
    it("should select first square to the left when vertical false and skipSpacers false", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getPrevIndex(1, false, false)).toBe(0);
        expect(service.getPrevIndex(432, false, false)).toBe(431);
      });
    });

    it("should select first number square to the left when vertical false and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getPrevIndex(70, false, true)).toBe(66);
        expect(service.getPrevIndex(374, false, true)).toBe(370);
      });
    });

    it("should select first number square in previous row when on left edge, vertical false and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getPrevIndex(21, false, true)).toBe(19);
        expect(service.getPrevIndex(87, false, true)).toBe(83);
      });
    });

    it("should select first square above when vertical true and skipSpacers false", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getPrevIndex(45, true, false)).toBe(24);
        expect(service.getPrevIndex(411, true, false)).toBe(390);
      });
    });

    it("should select first number square above when vertical true and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getPrevIndex(107, true, true)).toBe(65);
        expect(service.getPrevIndex(26, true, true)).toBe(5);
      });
    });

    it("should select last number square in the current column when on top edge, vertical true and skipSpacers true", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.getPrevIndex(77, true, true)).toBe(434);
        expect(service.getPrevIndex(41, true, true)).toBe(440);
      });
    });
  });

  describe("startsAcross", () => {
    it("should return true when spacer to the left", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsAcross(9)).toBe(true);
        expect(service.startsAcross(412)).toBe(true);
      });
    });

    it("should return return clue when on left puzzle edge", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsAcross(105)).toBe(true);
        expect(service.startsAcross(399)).toBe(true);
      });
    });

    it("should return false when spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsAcross(67)).toBe(false);
        expect(service.startsAcross(356)).toBe(false);
      });
    });

    it("should return false when not across start", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsAcross(24)).toBe(false);
        expect(service.startsAcross(376)).toBe(false);
      });
    });
  });

  describe("startsDown", () => {
    it("should return true when spacer above", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsDown(50)).toBe(true);
        expect(service.startsDown(394)).toBe(true);
      });
    });

    it("should return true when on top puzzle edge", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsDown(4)).toBe(true);
        expect(service.startsDown(19)).toBe(true);
      });
    });

    it("should return false when spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsDown(317)).toBe(false);
        expect(service.startsDown(420)).toBe(false);
      });
    });

    it("should return false when not down start", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.startsDown(158)).toBe(false);
        expect(service.startsDown(433)).toBe(false);
      });
    });
  });

  describe("endsAcross", () => {
    it("should return true when spacer to the right", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsAcross(7)).toBe(true);
        expect(service.endsAcross(431)).toBe(true);
      });
    });

    it("should return true when on right puzzle edge", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsAcross(167)).toBe(true);
        expect(service.endsAcross(440)).toBe(true);
      });
    });

    it("should return false when spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsAcross(63)).toBe(false);
        expect(service.endsAcross(432)).toBe(false);
      });
    });

    it("should return false when not across end", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsAcross(0)).toBe(false);
        expect(service.endsAcross(416)).toBe(false);
      });
    });
  });

  describe("endsDown", () => {
    it("should return true when spacer below", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsDown(42)).toBe(true);
        expect(service.endsDown(334)).toBe(true);
      });
    });

    it("should return true when on bottom puzzle edge", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsDown(421)).toBe(true);
        expect(service.endsDown(439)).toBe(true);
      });
    });

    it("should return false when spacer", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsDown(63)).toBe(false);
        expect(service.endsDown(432)).toBe(false);
      });
    });

    it("should return false when not down end", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.endsDown(3)).toBe(false);
        expect(service.endsDown(389)).toBe(false);
      });
    });
  });

  describe("isPuzzleStart", () => {
    it("should return true when index == 0", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.isPuzzleStart(0)).toBe(true);
      });
    });

    it("should return false when index > 0", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.isPuzzleStart(1)).toBe(false);
        expect(service.isPuzzleStart(440)).toBe(false);
      });
    });
  });

  describe("isPuzzleEnd", () => {
    it("should return true when index == number of squares", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.isPuzzleEnd(440)).toBe(true);
      });
    });

    it("should return false when index < number of squares", () => {
      service.activatePuzzle(testPuzzleId).subscribe(() => {
        expect(service.isPuzzleEnd(0)).toBe(false);
        expect(service.isPuzzleEnd(339)).toBe(false);
      });
    });
  });
});
