import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { BehaviorSubject } from "rxjs";
import { AuthService } from "./services/auth.service";
import { Router } from "@angular/router";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  const routerSpy = jasmine.createSpyObj("Router", ["navigateByUrl"]);
  const authServiceSpy = jasmine.createSpyObj("AuthService", ["currentUserId$"]);

  beforeEach(async () => {
    authServiceSpy.currentUserId$ = new BehaviorSubject<string | undefined>("user-id");

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the app", () => {
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'crossword-designer'`, () => {
    const app = fixture.componentInstance;
    expect(app.title).toEqual("crossword-designer");
  });

  describe("ngOnInit", () => {
    it("should re-route to sign-in when user id undefined", () => {
      authServiceSpy.currentUserId$.next(undefined);
      authServiceSpy.currentUserId$.subscribe(() => {
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith("/");
      });
    });
  });
});
