// src/components/AppSidebar.js
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CSidebar, CSidebarHeader, CSidebarBrand, CSidebarFooter, CSidebarToggler, CCloseButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
import { useAuthUser } from '../context/AuthUserContext'
import { navigationFor } from '../_nav.perm'
import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

const AppSidebar = () => {
  const { user } = useAuthUser()
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={92} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={92} />
        </CSidebarBrand>
        <CCloseButton className="d-lg-none" dark onClick={() => dispatch({ type: 'set', sidebarShow: false })} />
      </CSidebarHeader>

      {/* ✅ Sidebar filtrado por rol */}
      <AppSidebarNav items={navigationFor(user, navigation)} />

      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })} />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
