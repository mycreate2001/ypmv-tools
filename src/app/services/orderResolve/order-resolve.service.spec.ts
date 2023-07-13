import { TestBed } from '@angular/core/testing';

import { OrderListResolveService } from './order-list-resolve.service';

describe('OrderResolveService', () => {
  let service: OrderListResolveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderListResolveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
