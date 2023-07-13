# update history
## apply lazy for searchToolPage
   `<img [src]="model.images|url" loading="lazy">`
## code scan improvement(temporarily)
`temporarily select camera`
 [issue] still can not change default camera, so first times application still read default camera
## [2022-Nov-02] update database 
- services/firestore.service.ts
    search by queries & priority offline
    get/gets with priority offline
- change order table from 'bookingInfors' to 'orders'

# improvement database
## Selft history
### Overview
    - Every table have saveInfo{userId,createAt,createBy,histories}
### Need to do [2022-Oct-13]
- change SaveInfo interface for history                 => done
- Edit firebase.service > add: handler duplicate        => done
- share > util > function getUpdate(newObj,oldObject)   => done
- add history to cover, model,tool                      => done
### Use
- firebase.add(tbl,data,duplicateHandler)   duplicateHandler just run when <data> difference from <database>
### Issue
- it's speed time for reading old data from database -> it's can solve by using offline database (Proxy)

## reduce loading image
### Overview
- it's help to app reduce banwidth. Image just load from server when user can see it
- use directly browser directive loading="lazy"
- storage separate 2 parts (1 for thumbnail, 1 for normal image) => when upload image, software save thumbnail image automatically
### Use
- add directive loading="lazy" <img>
example: <img [src]="image.jpg" loading="lazy">
- for use thumbnail image. pipe url should be add 'thumb'
example: <img [src]="model.images|url:0:'thumb'" loading="lazy">

## Get Tool/cover last status =>done

# issue
## 1. User
### 1.1 Change password --> pending
### 1.2 Forget password --> pending
### 1.3 Delete user {database, auth} =>doing
    - add more item "deactive" for deleting account, and filter deactive=false on users page
    - auth/deactive => must be delete by manual

## 2. Order
### 2.1 Order can not check if same model => DONE
### 2.2 Improvement: print order

## 3.Search tool
### 3.1 not get id of tool (it's model id) =>fixed (It's OK)
### 3.2 search by toolID

## 4. Scaner
### 4.1 Improvement scan 2D, 1D such as datamatrix => done[2022.10.04]
Use Zxing ngx-scanner
## 5. check tool status
### 5.1 compQty=1 No check quantity
### 5.2 save tool status to other table
### 5.3 Database is for each checking times
git
## 6. Images
### 6.1 separate [thubnail image & full]
- [status]=> done
- [Lazyloading image]
- use brown directive loading="lazy"
- Issue => delete image error => Fixed

## 7. companies
### 7.1. company modal not get correct image => Done

## 8. Url for all pages & modals

## 9. Protect database
Not delete database, just set destroy data to database

## 10.Database
### 10.1 Cover(box) check modifile database before save children =>done

## 11.ToolStatusPage
- add isEdit for edit or see only

# release
## 2023Jul11
- change interface to tab
- scan to active any tab
- combine model & tool
- search include tool id