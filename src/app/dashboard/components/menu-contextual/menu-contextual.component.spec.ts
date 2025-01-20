import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuContextualComponent } from './menu-contextual.component';

describe('MenuContextualComponent', () => {
  let component: MenuContextualComponent;
  let fixture: ComponentFixture<MenuContextualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuContextualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuContextualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
