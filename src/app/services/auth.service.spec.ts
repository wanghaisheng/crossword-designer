import { TestBed } from "@angular/core/testing";

import { AuthService, User } from "./auth.service";
import { FirebaseService } from "./firebase.service";
import { of, throwError } from "rxjs";
import { UserInfo } from "@angular/fire/auth";

describe("AuthService", () => {
  let service: AuthService;

  const firebaseServiceSpy = jasmine.createSpyObj("FirebaseService", ["signInUser", "signOutUser", "getCurrentUser"]);

  const testUserInfo: UserInfo = {
    displayName: "Test Name",
    email: "test@email.com",
    uid: "test-uid",
    phoneNumber: "",
    photoURL: "",
    providerId: "",
  };

  const testUser: User = {
    name: "Test Name",
    email: "test@email.com",
    id: "test-uid",
  };

  beforeEach(() => {
    firebaseServiceSpy.signInUser.and.returnValue(of(undefined));
    firebaseServiceSpy.signOutUser.and.returnValue(of(undefined));
    firebaseServiceSpy.getCurrentUser.and.returnValue(testUserInfo);

    TestBed.configureTestingModule({
      providers: [{ provide: FirebaseService, useValue: firebaseServiceSpy }],
    });
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("signIn", () => {
    it("should emit new user", () => {
      service.signIn("test@email.com", "password").subscribe(() => {
        expect(service.currentUser$.value).toEqual(testUser);
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to sign in";
      firebaseServiceSpy.signInUser.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.signIn("test@email.com", "password").subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("signOut", () => {
    it("should emit null user", () => {
      service.signOut().subscribe(() => {
        expect(service.currentUser$.value).toBeNull();
      });
    });

    it("should throw error when unsuccessful", () => {
      const errorMsg = "Failed to sign out";
      firebaseServiceSpy.signOutUser.and.callFake(() => {
        return throwError(new Error(errorMsg));
      });

      service.signOut().subscribe(
        () => {},
        (err) => {
          expect(err.message).toEqual(errorMsg);
        }
      );
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user", () => {
      expect(service.getCurrentUser()).toEqual(testUser);
    });

    it("should return null", () => {
      firebaseServiceSpy.getCurrentUser.and.returnValue(null);

      expect(service.getCurrentUser()).toBeNull();
    });
  });
});
