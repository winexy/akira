import {bottomSheetModel} from 'shared/ui/bottom-sheet'

const SHARE_MANAGER_KEY = 'share-manager'

function showShareManager() {
  bottomSheetModel.showBottomSheet(SHARE_MANAGER_KEY)
}

function hideShareManager() {
  bottomSheetModel.hideBottomSheet(SHARE_MANAGER_KEY)
}

export const shareTaskModel = {
  SHARE_MANAGER_KEY,
  showShareManager,
  hideShareManager,
}
