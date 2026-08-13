import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CreateUser } from './create-user';

describe('CreateUser - role change', () => {
  let fixture: ComponentFixture<CreateUser>;
  let component: CreateUser;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateUser],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(CreateUser);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges(); // triggers constructor's loadUsers()

    const listReq = httpMock.expectOne((r) => r.method === 'GET' && r.url.endsWith('/api/users'));
    listReq.flush([
      { id: 'u1', username: 'admin', role: 'Admin' },
      { id: 'u2', username: 'bob', role: 'User' },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('sends a PATCH with the new role and updates the row on success', () => {
    (component as unknown as { changeRole: (u: unknown, role: string) => void }).changeRole(
      { id: 'u2', username: 'bob', role: 'User' },
      'Admin',
    );

    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/u2/role'));
    expect(req.request.body).toEqual({ role: 'Admin' });
    req.flush(null);

    const users = (component as unknown as { users: () => { id: string; role: string }[] }).users();
    expect(users.find((u) => u.id === 'u2')?.role).toBe('Admin');
  });

  it('drives a real <select> in the DOM for a non-self row end to end', () => {
    const selects = fixture.debugElement.queryAll(By.css('.create-user__row-role'));
    // Row order follows the fetched list: admin (self, disabled), bob.
    const bobSelect = selects[1].nativeElement as HTMLSelectElement;

    expect(bobSelect.disabled).toBe(false);

    bobSelect.value = 'Admin';
    bobSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.method === 'PATCH' && r.url.endsWith('/u2/role'));
    expect(req.request.body).toEqual({ role: 'Admin' });
    req.flush(null);
    fixture.detectChanges();

    expect(bobSelect.value).toBe('Admin');
  });
});
