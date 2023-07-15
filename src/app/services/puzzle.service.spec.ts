import { TestBed } from "@angular/core/testing";

import { Clue, OverlayType, PuzzleService, Square, SquareType } from "./puzzle.service";

describe("PuzzleService", () => {
  let service: PuzzleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuzzleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("numberPuzzle", () => {
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

      expect(acrossClues[0]).toEqual(new Clue(1, "It's not that simple", "YESANDNO"));
      expect(downClues[0]).toEqual(new Clue(1, "Sharp bark", "YIP"));

      expect(acrossClues[5]).toEqual(new Clue(21, "Reading can be found on it", "THAMES"));
      expect(downClues[18]).toEqual(new Clue(22, "Mouthing off", "SASS"));

      expect(acrossClues[10]).toEqual(new Clue(28, "Pirate fodder, once", "BLANKCDS"));
      expect(downClues[20]).toEqual(new Clue(29, "", "LAY"));

      expect(acrossClues[21]).toEqual(new Clue(50, "", "ASSETS"));
      expect(downClues[34]).toEqual(new Clue(50, "", "ATUL"));

      expect(acrossClues[60]).toEqual(new Clue(128, "", "TOTHEMAX"));
      expect(downClues[78]).toEqual(new Clue(122, "", "SEX"));
    });
  });
});
