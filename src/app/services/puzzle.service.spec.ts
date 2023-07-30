import { TestBed } from "@angular/core/testing";

import { Clue, PuzzleService, Square, SquareType } from "./puzzle.service";

describe("PuzzleService", () => {
  let service: PuzzleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuzzleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("activatePuzzle", () => {
    it("should number squares", () => {
      service.activatePuzzle("test");

      const grid = service.getActiveGrid();

      expect(grid[0]).toEqual(new Square(0, "Y", 1, 1, 1));
      expect(grid[198]).toEqual(new Square(198, "U", -1, 63, 50));
      expect(grid[223]).toEqual(new Square(223, "", -1, -1, -1, SquareType.Spacer));
      expect(grid[440]).toEqual(new Square(440, "X", -1, 128, 122));
    });

    it("should associate clues", () => {
      service.activatePuzzle("test");

      const acrossClues = service.getActiveAcross();
      const downClues = service.getActiveDown();

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

  describe("setSquareValue", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should set square value to new letter", () => {
      service.setSquareValue(23, "x");

      service.$activeGrid.subscribe((grid) => {
        expect(grid[23].value).toEqual("X");
      });

      service.$activeAcrossClue.subscribe((clue) => {
        expect(clue.answer).toEqual("IDXTAROD");
      });

      service.$activeDownClue.subscribe((clue) => {
        expect(clue.answer).toEqual("SXRE");
      });
    });

    it("should set square value to space", () => {
      service.setSquareValue(440, " ");

      service.$activeGrid.subscribe((grid) => {
        expect(grid[440].value).toEqual(" ");
      });

      service.$activeAcrossClue.subscribe((clue) => {
        expect(clue.answer).toEqual("TOTHEMA ");
      });

      service.$activeDownClue.subscribe((clue) => {
        expect(clue.answer).toEqual("SE ");
      });
    });
  });

  describe("getNextIndex", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should select first square to the right when vertical false and skipSpacers false", () => {
      expect(service.getNextIndex(0, false, false)).toBe(1);
      expect(service.getNextIndex(431, false, false)).toBe(432);
    });

    it("should select first number square to the right when vertical false and skipSpacers true", () => {
      expect(service.getNextIndex(66, false, true)).toBe(70);
      expect(service.getNextIndex(370, false, true)).toBe(374);
    });

    it("should select first number square in next row when on right edge, vertical false and skipSpacers true", () => {
      expect(service.getNextIndex(19, false, true)).toBe(21);
      expect(service.getNextIndex(83, false, true)).toBe(87);
    });

    it("should select first square below when vertical true and skipSpacers false", () => {
      expect(service.getNextIndex(24, true, false)).toBe(45);
      expect(service.getNextIndex(390, true, false)).toBe(411);
    });

    it("should select first number square below when vertical true and skipSpacers true", () => {
      expect(service.getNextIndex(65, true, true)).toBe(107);
      expect(service.getNextIndex(5, true, true)).toBe(26);
    });

    it("should select first number square in the current column when on bottom edge, vertical true and skipSpacers true", () => {
      expect(service.getNextIndex(434, true, true)).toBe(77);
      expect(service.getNextIndex(440, true, true)).toBe(41);
    });
  });

  describe("getPrevIndex", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should select first square to the left when vertical false and skipSpacers false", () => {
      expect(service.getPrevIndex(1, false, false)).toBe(0);
      expect(service.getPrevIndex(432, false, false)).toBe(431);
    });

    it("should select first number square to the left when vertical false and skipSpacers true", () => {
      expect(service.getPrevIndex(70, false, true)).toBe(66);
      expect(service.getPrevIndex(374, false, true)).toBe(370);
    });

    it("should select first number square in previous row when on left edge, vertical false and skipSpacers true", () => {
      expect(service.getPrevIndex(21, false, true)).toBe(19);
      expect(service.getPrevIndex(87, false, true)).toBe(83);
    });

    it("should select first square above when vertical true and skipSpacers false", () => {
      expect(service.getPrevIndex(45, true, false)).toBe(24);
      expect(service.getPrevIndex(411, true, false)).toBe(390);
    });

    it("should select first number square above when vertical true and skipSpacers true", () => {
      expect(service.getPrevIndex(107, true, true)).toBe(65);
      expect(service.getPrevIndex(26, true, true)).toBe(5);
    });

    it("should select last number square in the current column when on top edge, vertical true and skipSpacers true", () => {
      expect(service.getPrevIndex(77, true, true)).toBe(434);
      expect(service.getPrevIndex(41, true, true)).toBe(440);
    });
  });

  describe("isAcrossStart", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should return true when spacer to the left", () => {
      expect(service.isAcrossStart(9)).toBe(true);
      expect(service.isAcrossStart(412)).toBe(true);
    });

    it("should return true when on left puzzle edge", () => {
      expect(service.isAcrossStart(105)).toBe(true);
      expect(service.isAcrossStart(399)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.isAcrossStart(67)).toBe(false);
      expect(service.isAcrossStart(356)).toBe(false);
    });

    it("should return false when not across start", () => {
      expect(service.isAcrossStart(24)).toBe(false);
      expect(service.isAcrossStart(376)).toBe(false);
    });
  });

  describe("isDownStart", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should return true when spacer above", () => {
      expect(service.isDownStart(50)).toBe(true);
      expect(service.isDownStart(394)).toBe(true);
    });

    it("should return true when on top puzzle edge", () => {
      expect(service.isDownStart(4)).toBe(true);
      expect(service.isDownStart(19)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.isDownStart(317)).toBe(false);
      expect(service.isDownStart(420)).toBe(false);
    });

    it("should return false when not down start", () => {
      expect(service.isDownStart(158)).toBe(false);
      expect(service.isDownStart(433)).toBe(false);
    });
  });

  describe("isAcrossEnd", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should return true when spacer to the right", () => {
      expect(service.isAcrossEnd(7)).toBe(true);
      expect(service.isAcrossEnd(431)).toBe(true);
    });

    it("should return true when on right puzzle edge", () => {
      expect(service.isAcrossEnd(167)).toBe(true);
      expect(service.isAcrossEnd(440)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.isAcrossEnd(63)).toBe(false);
      expect(service.isAcrossEnd(432)).toBe(false);
    });

    it("should return false when not across end", () => {
      expect(service.isAcrossEnd(0)).toBe(false);
      expect(service.isAcrossEnd(416)).toBe(false);
    });
  });

  describe("isDownEnd", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should return true when spacer below", () => {
      expect(service.isDownEnd(42)).toBe(true);
      expect(service.isDownEnd(334)).toBe(true);
    });

    it("should return true when on bottom puzzle edge", () => {
      expect(service.isDownEnd(421)).toBe(true);
      expect(service.isDownEnd(439)).toBe(true);
    });

    it("should return false when spacer", () => {
      expect(service.isDownEnd(63)).toBe(false);
      expect(service.isDownEnd(432)).toBe(false);
    });

    it("should return false when not down end", () => {
      expect(service.isDownEnd(3)).toBe(false);
      expect(service.isDownEnd(389)).toBe(false);
    });
  });

  describe("isPuzzleStart", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should return true when index == 0", () => {
      expect(service.isPuzzleStart(0)).toBe(true);
    });

    it("should return false when index > 0", () => {
      expect(service.isPuzzleStart(1)).toBe(false);
      expect(service.isPuzzleStart(440)).toBe(false);
    });
  });

  describe("isPuzzleEnd", () => {
    beforeEach(() => {
      service.activatePuzzle("test");
    });

    it("should return true when index == number of squares", () => {
      expect(service.isPuzzleEnd(440)).toBe(true);
    });

    it("should return false when index < number of squares", () => {
      expect(service.isPuzzleEnd(0)).toBe(false);
      expect(service.isPuzzleEnd(339)).toBe(false);
    });
  });
});
