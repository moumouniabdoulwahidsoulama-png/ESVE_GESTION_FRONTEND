import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonCommandeListComponent } from './bon-commande-list.component';

describe('BonCommandeListComponent', () => {
  let component: BonCommandeListComponent;
  let fixture: ComponentFixture<BonCommandeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonCommandeListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BonCommandeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
