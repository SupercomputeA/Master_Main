name: Validate Supercompute Build

run: |
  echo "=== Supercompute Build Validation ==="
  
  # 1. Check HTML exists and is valid
  echo "1. Checking HTML..."
  if [ -f "public/Supercompute.html" ]; then
    echo "   ✓ Supercompute.html exists"
  else
    echo "   ✗ Supercompute.html missing"
    exit 1
  fi
  
  # 2. Check required sections exist
  echo "2. Checking nav sections..."
  grep -q 'nav-section.*Public' public/Supercompute.html && echo "   ✓ Public section"
  grep -q 'nav-section.*Member' public/Supercompute.html && echo "   ✓ Member section" 
  grep -q 'nav-section.*Admin' public/Supercompute.html && echo "   ✓ Admin section"
  
  # 3. Check pages exist
  echo "3. Checking pages..."
  grep -q 'page-home' public/Supercompute.html && echo "   ✓ Home page"
  grep -q 'page-staking' public/Supercompute.html && echo "   ✓ Staking page"
  grep -q 'page-token' public/Supercompute.html && echo "   ✓ Token page"
  
  # 4. Check auth gate on member pages
  echo "4. Checking auth protection..."
  grep -q "authGate('staking'" public/Supercompute.html && echo "   ✓ Staking locked"
  grep -q "authGate('token'" public/Supercompute.html && echo "   ✓ Token locked"
  
  # 5. Check CSS exists
  echo "5. Checking styles..."
  [ -f "public/sc.css" ] && echo "   ✓ sc.css exists"
  
  # 6. Check JS exists
  echo "6. Checking scripts..."
  [ -f "public/sc-logic.js" ] && echo "   ✓ sc-logic.js exists"
  
  echo ""
  echo "=== Validation Complete ==="
